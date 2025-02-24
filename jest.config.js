module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],

  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        expand: true,
      },
    ],
  ],
  verbose: true
}
