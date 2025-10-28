export default function NotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <h1 style={{ fontSize: "6rem", marginBottom: "1rem" }}>404</h1>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Page Not Found</h2>
          <p style={{ marginBottom: "2rem", maxWidth: "500px" }}>
            The page you are looking for doesn't exist or has been moved.
          </p>
          <a
            href="/"
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Return Home
          </a>
        </div>
      </body>
    </html>
  )
}
