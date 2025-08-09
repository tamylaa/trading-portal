// src/worker/utils/token.js
function base64UrlDecode(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function verifyToken(token, env) {
  try {
    if (!token) {
      throw new Error("No token provided");
    }
    if (!env || !env.AUTH_JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured in environment variables");
    }
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error("Invalid token format");
    }
    const isValid = await crypto.subtle.verify(
      { name: "HMAC", hash: "SHA-256" },
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.AUTH_JWT_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      ),
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!isValid) {
      throw new Error("Invalid token signature");
    }
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload))
    );
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token has expired");
    }
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    throw new Error("Invalid token");
  }
}

// src/worker/index.js
async function sendMagicLinkEmail(email, magicLink, name, env) {
  try {
    console.log(`Attempting to send email to: ${email}`);
    if (env.EMAIL_SERVICE) {
      console.log("Using service binding for email service");
      const htmlContent2 = generateMagicLinkEmailHTML(name, magicLink);
      const emailPayload2 = {
        to: [email],
        subject: "Your Tamyla Magic Link",
        htmlContent: htmlContent2,
        textContent: `Your magic link: ${magicLink}`
      };
      console.log("Sending email via service binding with payload:", {
        to: emailPayload2.to,
        subject: emailPayload2.subject,
        hasHtml: !!emailPayload2.htmlContent,
        hasText: !!emailPayload2.textContent
      });
      const request = new Request("https://email.tamyla.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Tamyla-Auth-Service/1.0"
        },
        body: JSON.stringify(emailPayload2)
      });
      const response2 = await env.EMAIL_SERVICE.fetch(request);
      console.log(`Email service response status: ${response2.status}`);
      if (!response2.ok) {
        const errorText = await response2.text();
        console.error(`Email service error response: ${errorText}`);
        throw new Error(`Email service error: ${response2.status} - ${errorText}`);
      }
      const result2 = await response2.json();
      console.log("Email sent successfully via service binding:", result2);
      return { success: true, messageId: result2.messageId };
    }
    if (!env.AUTO_EMAIL_SERVICE_URL) {
      throw new Error("Neither EMAIL_SERVICE binding nor AUTO_EMAIL_SERVICE_URL configured");
    }
    console.log(`Fallback: Using email service URL: ${env.AUTO_EMAIL_SERVICE_URL}`);
    const htmlContent = generateMagicLinkEmailHTML(name, magicLink);
    const emailPayload = {
      to: [email],
      subject: "Your Tamyla Magic Link",
      htmlContent,
      textContent: `Your magic link: ${magicLink}`
    };
    console.log("Sending email with payload:", {
      to: emailPayload.to,
      subject: emailPayload.subject,
      hasHtml: !!emailPayload.htmlContent,
      hasText: !!emailPayload.textContent,
      url: `${env.AUTO_EMAIL_SERVICE_URL}/emails`
    });
    console.log("About to make fetch request to email service...");
    const response = await fetch(`${env.AUTO_EMAIL_SERVICE_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Tamyla-Auth-Service/1.0"
      },
      body: JSON.stringify(emailPayload)
    });
    console.log(`Email service response status: ${response.status}`);
    console.log(`Email service response headers:`, Object.fromEntries(response.headers.entries()));
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Email service error response: ${errorText}`);
      console.error(`Full response status: ${response.status} ${response.statusText}`);
      console.error(`Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Email service error: ${response.status} - ${errorText}`);
    }
    const responseText = await response.text();
    console.log("Raw email service response:", responseText);
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse email service response as JSON:", parseError);
      throw new Error(`Invalid response from email service: ${responseText}`);
    }
    console.log("Email sent successfully:", result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}
async function updateMagicLinkStatus(linkId, emailSent, env) {
  try {
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    await fetch(`${dataServiceUrl}/auth/magic-link/${linkId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...env.DATA_SERVICE_API_KEY && { "Authorization": `Bearer ${env.DATA_SERVICE_API_KEY}` }
      },
      body: JSON.stringify({
        emailSent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      })
    });
  } catch (error) {
    console.error("Failed to update magic link status:", error);
  }
}
function generateMagicLinkEmailHTML(name, magicLink) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            border: 3px solid #4CAF50; 
            border-radius: 10px; 
            background-color: #ffffff;
          }
          .header { color: #4CAF50; text-align: center; margin-bottom: 20px; }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
          }
          .info-box { 
            background-color: #f0f8ff; 
            padding: 15px; 
            border-radius: 5px; 
            border-left: 4px solid #4CAF50;
            margin: 20px 0;
          }
          .url-text { 
            font-size: 12px; 
            color: #666;
            word-break: break-all;
            background-color: #f5f5f5; 
            padding: 10px; 
            border-radius: 4px; 
            font-family: monospace; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="header">\u{1F511} Your Tamyla Magic Link</h2>
          <p>Hello ${n||"there"},</p>
          <p><strong>Click the button below to automatically sign in to your account. No email entry required!</strong></p>
          <a href="${e}" class="button">\u{1F680} Auto Sign In to Tamyla</a>
          <div class="info-box">
            <strong>What happens next:</strong><br>
            1. Click the link above<br>
            2. Automatically redirects and logs you in<br>
            3. Takes you to your dashboard<br>
            4. No additional steps needed!
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <div class="url-text">${e}</div>
          <p><small>This link will expire in 15 minutes for security. If you didn't request this email, you can safely ignore it.</small></p>
        </div>
      </body>
    </html>
  `;
}
function addCorsHeaders(response, origin, env) {
  const allowedOrigins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",") : ["*"];
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  } else {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      const response2 = new Response(null, { status: 204 });
      return addCorsHeaders(response2, origin, env);
    }
    let response;
    if (url.pathname === "/auth/magic-link" && request.method === "POST") {
      response = await handleMagicLinkRequest(request, env);
    } else if (url.pathname === "/auth/verify" && request.method === "GET") {
      response = await handleMagicLinkVerification(url.searchParams, env);
    } else if (url.pathname === "/auth/verify" && request.method === "POST") {
      response = await handleMagicLinkVerificationPost(request, env);
    } else if (url.pathname === "/auth/session-exchange" && request.method === "POST") {
      response = await handleSessionExchange(request, env);
    } else if (url.pathname === "/auth/me" && request.method === "GET") {
      response = await handleCurrentUser(request, env);
    } else if (url.pathname === "/auth/me" && request.method === "PUT") {
      response = await handleUpdateProfile(request, env);
    } else if (url.pathname === "/auth/introspect" && request.method === "POST") {
      response = await handleTokenIntrospection(request, env);
    } else if (url.pathname === "/health" || url.pathname === "/") {
      if (url.searchParams.get("detailed") === "true") {
        response = await handleDetailedHealthCheck(env);
      } else {
        response = await handleHealthCheck(env);
      }
    } else {
      response = new Response(JSON.stringify({
        status: "error",
        error: "Not Found",
        message: "The requested resource was not found",
        path: url.pathname,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return addCorsHeaders(response, origin, env);
  }
};
async function handleMagicLinkRequest(request, env) {
  try {
    const { email, name, action } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const frontendUrl = env.FRONTEND_URL || "https://www.tamyla.com";
    const magicLinkResponse = await fetch(`${dataServiceUrl}/auth/magic-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...env.DATA_SERVICE_API_KEY && { "Authorization": `Bearer ${env.DATA_SERVICE_API_KEY}` }
      },
      body: JSON.stringify({ email, name, action })
      // Include action parameter
    });
    if (!magicLinkResponse.ok) {
      const errorData = await magicLinkResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: "Failed to create magic link",
          details: env.ENVIRONMENT === "development" ? errorData : void 0
        }),
        { status: magicLinkResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const linkResult = await magicLinkResponse.json();
    if (linkResult.success && linkResult.token) {
      const authServiceUrl = "https://auth.tamyla.com";
      const magicLink = `${authServiceUrl}/auth/verify?token=${linkResult.token}`;
      console.log(`Sending magic link email with URL: ${magicLink}`);
      const emailResult = await sendMagicLinkEmail(email, magicLink, name, env);
      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.error);
        if (linkResult.id) {
          await updateMagicLinkStatus(linkResult.id, false, env);
        }
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to send magic link email",
            details: emailResult.error || "Email delivery failed",
            magicLink: `https://auth.tamyla.com/auth/verify?token=${linkResult.token}`,
            // Show the correct URL
            debugInfo: {
              emailServiceUrl: env.AUTO_EMAIL_SERVICE_URL,
              frontendUrl,
              token: linkResult.token
            }
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      if (linkResult.id) {
        await updateMagicLinkStatus(linkResult.id, true, env);
      }
      console.log("Magic link email sent successfully");
    } else {
      console.error("Data service did not return a valid magic link token");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to generate magic link",
          details: "Data service did not return a valid token"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Magic link sent successfully",
        // Temporarily return magic link for debugging
        magicLink: `https://auth.tamyla.com/auth/verify?token=${linkResult.token}`,
        debug: {
          frontendUrl,
          token: linkResult.token,
          environment: env.ENVIRONMENT
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Magic link error:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to process magic link request",
        details: error.message,
        errorType: error.name,
        stack: env.ENVIRONMENT === "development" ? error.stack : void 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleMagicLinkVerification(params, env) {
  const token = params.get("token");
  console.log("Verification GET request received with token:", token);
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Token is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  try {
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const verifyResponse = await fetch(`${dataServiceUrl}/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...env.DATA_SERVICE_API_KEY && { "Authorization": `Bearer ${env.DATA_SERVICE_API_KEY}` }
      },
      body: JSON.stringify({ token })
    });
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
          details: env.ENVIRONMENT === "development" ? errorData : void 0
        }),
        { status: verifyResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await verifyResponse.json();
    const sessionToken = crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 5 * 60 * 1e3);
    const sessionData = {
      user: result.user,
      token: result.token,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: sessionExpiry.toISOString()
    };
    await env.AUTH.put(sessionToken, JSON.stringify(sessionData), {
      expirationTtl: 300
      // 5 minutes
    });
    console.log(`Created secure session ${sessionToken} for user ${result.user?.email}, expires at ${sessionExpiry}`);
    const frontendUrl = env.FRONTEND_URL || "https://www.tamyla.com";
    const redirectUrl = new URL("/", frontendUrl);
    redirectUrl.searchParams.set("session", sessionToken);
    console.log(`Magic link verified for session ${sessionToken} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl.toString(),
        // Set HTTP-only cookie as backup
        "Set-Cookie": `auth_session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid or expired token",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleMagicLinkVerificationPost(request, env) {
  try {
    const { token, clientInfo } = await request.json();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const verifyResponse = await fetch(`${dataServiceUrl}/auth/magic-link/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...env.DATA_SERVICE_API_KEY && { "Authorization": `Bearer ${env.DATA_SERVICE_API_KEY}` }
      },
      body: JSON.stringify({ token })
    });
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
          details: env.ENVIRONMENT === "development" ? errorData : void 0
        }),
        { status: verifyResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await verifyResponse.json();
    return new Response(
      JSON.stringify({
        success: true,
        user: result.user,
        token: result.token
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${result.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
        }
      }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid or expired token",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleHealthCheck(env) {
  try {
    const isDataServiceConnected = await testDataServiceConnection(env);
    return new Response(
      JSON.stringify({
        status: isDataServiceConnected ? "ok" : "error",
        services: {
          dataService: isDataServiceConnected ? "connected" : "disconnected"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: env.ENVIRONMENT || "development",
        note: "For detailed diagnostics, use /health?detailed=true"
      }),
      {
        status: isDataServiceConnected ? 200 : 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        error: "Health check failed",
        details: env.ENVIRONMENT === "development" ? error.message : void 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleDetailedHealthCheck(env) {
  const kvBinding = env?.AUTH_DEV || env?.AUTH;
  const status = {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: env?.ENVIRONMENT || "development",
    bindings: Object.keys(env || {}),
    kv: {
      available: !!kvBinding,
      binding: kvBinding ? env.AUTH_DEV ? "AUTH_DEV" : "AUTH" : "none",
      type: kvBinding ? typeof kvBinding : "undefined",
      methods: {}
    },
    dataService: {
      connected: false,
      error: null,
      details: null
    }
  };
  if (kvBinding) {
    const methods = ["get", "put", "delete", "list"];
    for (const method of methods) {
      status.kv.methods[method] = typeof kvBinding[method] === "function";
    }
    try {
      const testKey = `test-${Date.now()}`;
      const testValue = `value-${Math.random().toString(36).substring(2, 8)}`;
      await kvBinding.put(testKey, testValue);
      const readValue = await kvBinding.get(testKey);
      const listResult = await kvBinding.list();
      status.kv.test = {
        write: {
          key: testKey,
          expected: testValue,
          actual: readValue,
          success: readValue === testValue
        },
        list: {
          keys: listResult.keys.map((k) => k.name),
          list_complete: listResult.list_complete
        },
        cleanup: {
          success: true
        }
      };
      try {
        await kvBinding.delete(testKey);
      } catch (cleanupError) {
        status.kv.test.cleanup = {
          success: false,
          error: cleanupError.message
        };
      }
    } catch (error) {
      status.kv.test = {
        error: error.message,
        stack: error.stack,
        name: error.name
      };
      status.status = "error";
    }
  }
  try {
    const startTime = Date.now();
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const response = await fetch(`${dataServiceUrl}/health`);
    const duration = Date.now() - startTime;
    status.dataService.connected = response.ok;
    status.dataService.responseTime = `${duration}ms`;
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      status.dataService.error = errorText;
    }
  } catch (error) {
    status.dataService.error = error.message;
    status.dataService.details = {
      error: error.toString(),
      stack: env.ENVIRONMENT === "development" ? error.stack : void 0
    };
    status.status = "error";
    console.error("Data Service health check failed:", error);
  }
  return new Response(
    JSON.stringify(status, null, 2),
    {
      status: status.status === "error" ? 503 : 200,
      headers: {
        "Content-Type": "application/json",
        "X-Health-Check": "detailed",
        "Cache-Control": "no-store"
      }
    }
  );
}
async function testDataServiceConnection(env) {
  try {
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const response = await fetch(`${dataServiceUrl}/health`);
    console.log("Data Service connection test successful");
    return response.ok;
  } catch (error) {
    console.error("Data Service connection test failed:", error);
    return false;
  }
}
async function handleCurrentUser(request, env) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cookies = request.headers.get("Cookie");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (cookies) {
      const sessionMatch = cookies.match(/session=([^;]+)/);
      if (sessionMatch) {
        token = sessionMatch[1];
      }
    }
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const response = await fetch(`${dataServiceUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        ...env.DATA_SERVICE_API_KEY && { "X-API-Key": env.DATA_SERVICE_API_KEY }
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          error: "Failed to get user information",
          details: env.ENVIRONMENT === "development" ? errorData : void 0
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await response.json();
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to get user information",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleUpdateProfile(request, env) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const profileData = await request.json();
    if (!profileData.name || !profileData.phone) {
      return new Response(
        JSON.stringify({ error: "Name and phone are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const dataServiceUrl = env.DATA_SERVICE_URL || "https://data-service.tamylatrading.workers.dev";
    const response = await fetch(`${dataServiceUrl}/auth/me`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...env.DATA_SERVICE_API_KEY && { "X-API-Key": env.DATA_SERVICE_API_KEY }
      },
      body: JSON.stringify({
        name: profileData.name,
        phone: profileData.phone,
        company: profileData.company || "",
        position: profileData.position || ""
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Data service profile update failed:", errorData);
      console.error("Data service response status:", response.status);
      console.error("Data service response headers:", [...response.headers.entries()]);
      return new Response(
        JSON.stringify({
          error: "Failed to update profile",
          details: env.ENVIRONMENT === "development" ? errorData : void 0
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await response.json();
    console.log("Profile updated successfully for user:", result.user?.email);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile updated successfully",
        user: result.user
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update profile",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleTokenIntrospection(request, env) {
  try {
    const { token } = await request.json();
    if (!token) {
      return new Response(
        JSON.stringify({
          active: false,
          error: "Token is required"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    try {
      const decoded = await verifyToken(token, env);
      return new Response(
        JSON.stringify({
          active: true,
          sub: decoded.userId,
          email: decoded.email,
          exp: decoded.exp,
          iat: decoded.iat,
          scope: "user",
          client_id: "content-store-service"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return new Response(
        JSON.stringify({
          active: false,
          error: "Invalid or expired token"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Token introspection error:", error);
    return new Response(
      JSON.stringify({
        active: false,
        error: "Failed to introspect token",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
async function handleSessionExchange(request, env) {
  try {
    const { sessionToken } = await request.json();
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: "Session token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const sessionDataJson = await env.AUTH.get(sessionToken);
    if (!sessionDataJson) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    let sessionData;
    try {
      sessionData = JSON.parse(sessionDataJson);
    } catch (err) {
      console.error("Failed to parse session data:", err);
      return new Response(
        JSON.stringify({ error: "Invalid session data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (/* @__PURE__ */ new Date() > new Date(sessionData.expiresAt)) {
      await env.AUTH.delete(sessionToken);
      return new Response(
        JSON.stringify({ error: "Session token has expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(`Session exchange requested for token: ${sessionToken}`);
    await env.AUTH.delete(sessionToken);
    console.log(`Session ${sessionToken} exchanged for JWT for user ${sessionData.user?.email} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
    return new Response(
      JSON.stringify({
        success: true,
        token: sessionData.token,
        // Return the actual JWT from magic link verification
        user: sessionData.user
        // Return the actual user data
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Session exchange error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to exchange session token",
        details: env.ENVIRONMENT === "development" ? error.message : void 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export {
  index_default as default
};
//# sourceMappingURL=worker.js.map
