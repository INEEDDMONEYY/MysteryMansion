// jest.config.js
module.exports = {
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker)', // 👈 allow faker to be transformed
  ],
};
