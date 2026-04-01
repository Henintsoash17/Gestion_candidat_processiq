export const axiosMockClient = {
  interceptors: {
    request: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const axios = {
  create: jest.fn(() => axiosMockClient),
};

export default axios;
