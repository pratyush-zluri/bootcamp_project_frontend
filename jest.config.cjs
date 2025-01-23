module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/setupTests.mjs'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
        '^.+\\.jsx?$': 'babel-jest', // Use babel-jest for JavaScript/JSX files
        '^.+\\.mjs$': 'babel-jest', // Use babel-jest for .mjs files
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
        '^@/(.*)$': '<rootDir>/src/$1', // Alias for root imports
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@testing-library|lucide-react|framer-motion)/)'
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}', // Include .ts/.tsx files
        '!src/**/*.d.ts',   // Exclude TypeScript declaration files
    ],
    collectCoverage: true,
};
