const defaultPorts = {
  production: {
    server: process.env.PORT,
  },
  development: {
    browser: 8080,
    server: 8081,
  },
};

export default defaultPorts;
