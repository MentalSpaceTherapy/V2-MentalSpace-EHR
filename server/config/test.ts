export const config = {
  database: {
    url: 'postgresql://localhost:5432/mental_health_dashboard_test',
    ssl: false
  },
  session: {
    secret: 'test-secret-key',
    resave: false,
    saveUninitialized: false
  }
}; 