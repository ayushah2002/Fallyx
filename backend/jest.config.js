module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Where to find tests (root level tests folder)
  roots: ['<rootDir>/tests'],
  
  // Test file matching pattern
  testMatch: ['**/*.test.ts'],
  
  // Module path aliases (must match your tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // TypeScript handling
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  
  // Important for proper module resolution
  modulePaths: ['<rootDir>/src'],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ]
}