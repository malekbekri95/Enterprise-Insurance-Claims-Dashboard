// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/*
 * ---------------------------------------------------------------------------
 * Architecture boundaries
 * ---------------------------------------------------------------------------
 * Every layer gets exactly one `no-restricted-imports` configuration (flat
 * config does not merge rule options, the last matching block wins), so the
 * blocks below target disjoint file globs.
 *
 * Patterns are regular expressions matched against the import specifier and
 * cover both path aliases (`@features/...`) and relative imports
 * (`../../features/...`).
 */
const FEATURES_DIR = path.join(__dirname, 'src/app/features');
const FEATURES = fs
  .readdirSync(FEATURES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const layer = (name) => `(^@${name}/|(^|/)${name}/)`;

const forbid = (regex, message) => ({ regex, message });

const NO_HTTP_CLIENT = {
  name: '@angular/common/http',
  importNames: ['HttpClient'],
  message: 'HttpClient may only be used inside a feature data-access layer.',
};

const NO_FEATURES = forbid(layer('features'), 'This layer must not depend on feature code.');
const NO_LAYOUT = forbid(layer('layout'), 'This layer must not depend on the application layout.');
const NO_CORE = forbid(layer('core'), 'Shared code must stay independent from core infrastructure.');
const NO_SHARED = forbid(layer('shared'), 'Core infrastructure must not depend on shared UI code.');

const restrict = (files, patterns, paths = [NO_HTTP_CLIENT]) => ({
  files: [files],
  rules: { 'no-restricted-imports': ['error', { paths, patterns }] },
});

const featureBoundaries = FEATURES.flatMap((feature) => {
  const otherFeatures = FEATURES.filter((other) => other !== feature).map((other) =>
    forbid(`(^@features/|(^|/)features/|\\.\\./)${other}/`,`Feature "${feature}" must not import feature "${other}".`),
  );
  const root = `src/app/features/${feature}`;

  return [
    // Domain: framework-agnostic business models and rules.
    restrict(`${root}/domain/**/*.ts`, [
      ...otherFeatures,
      NO_LAYOUT,
      forbid('(^|/)(data-access|feature)/', 'Domain must not depend on data-access or feature layers.'),
      forbid('^@angular/', 'Domain must stay framework-agnostic (no Angular imports).'),
      forbid('^rxjs', 'Domain must stay framework-agnostic (no RxJS).'),
    ]),
    // Data-access: API services, DTOs, mappers, state. The only place HttpClient is allowed.
    restrict(
      `${root}/data-access/**/*.ts`,
      [...otherFeatures, NO_LAYOUT, forbid('(^|/)feature/', 'Data-access must not depend on the feature (UI) layer.')],
      [],
    ),
    // Feature: pages and UI components.
    restrict(`${root}/feature/**/*.ts`, [...otherFeatures, NO_LAYOUT]),
  ];
});

const architectureBoundaries = [
  restrict('src/app/core/**/*.ts', [NO_FEATURES, NO_LAYOUT, NO_SHARED]),
  restrict('src/app/shared/**/*.ts', [NO_FEATURES, NO_LAYOUT, NO_CORE]),
  restrict('src/app/layout/**/*.ts', [NO_FEATURES]),
  ...featureBoundaries,
];

module.exports = tseslint.config(
  { ignores: ['dist/**', '.angular/**', 'coverage/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  ...architectureBoundaries,
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
);
