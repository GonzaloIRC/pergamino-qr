module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build', // Cambios que afectan al sistema de construcción o dependencias externas
        'chore', // Otros cambios que no modifican archivos src o test
        'ci', // Cambios en archivos y scripts de integración continua
        'docs', // Solo cambios en la documentación
        'feat', // Una nueva característica
        'fix', // Corrección de un error
        'perf', // Cambio que mejora el rendimiento
        'refactor', // Un cambio de código que no corrige un error ni añade una característica
        'revert', // Revierte un commit anterior
        'style', // Cambios que no afectan el significado del código (espacios en blanco, formato, etc)
        'test', // Añadir pruebas faltantes o corregir pruebas existentes
      ],
    ],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
