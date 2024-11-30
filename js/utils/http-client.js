export class HttpError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

export class HttpClient {
  constructor(baseUrl = '', defaultConfig = {}, defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = new Headers({
      'Content-Type': 'application/json',
      ...defaultHeaders,
    });
    this.defaultConfig = {
      timeout: 10000, // 10 seconds default timeout
      retries: 3, // Default retry attempts
      retryDelay: 1000, // Default delay between retries in ms
      headers: this.defaultHeaders,
      ...defaultConfig,
    };
  }

  // Helper method to merge headers
  mergeHeaders(configHeaders) {
    const merged = new Headers(this.defaultHeaders);
    
    if (configHeaders) {
      const headers = configHeaders instanceof Headers
        ? configHeaders
        : new Headers(configHeaders);
      
      headers.forEach((value, key) => {
        merged.set(key, value);
      });
    }
    
    return merged;
  }

  async fetchWithTimeout(url, config) {
    const { timeout = this.defaultConfig.timeout } = config;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Merge headers before making the request
      const headers = this.mergeHeaders(config.headers);
      
      const response = await fetch(url, {
        ...config,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new HttpError(
        response.statusText || 'Request failed',
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  async retryRequest(url, config, attempt = 1) {
    try {
      const response = await this.fetchWithTimeout(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (
        attempt < (config.retries || this.defaultConfig.retries) &&
        (error instanceof HttpError || error instanceof TypeError)
      ) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            config.retryDelay || this.defaultConfig.retryDelay
          )
        );
        return this.retryRequest(url, config, attempt + 1);
      }
      throw error;
    }
  }

  buildUrl(endpoint) {
    return `${this.baseUrl}${endpoint}`;
  }

  // Method to update default headers
  setDefaultHeaders(headers) {
    Object.entries(headers).forEach(([key, value]) => {
      this.defaultHeaders.set(key, value);
    });
  }

  // Method to get current default headers
  getDefaultHeaders() {
    return new Headers(this.defaultHeaders);
  }

  async get(endpoint, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'GET',
    });
  }

  async post(endpoint, data, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, config = {}) {
    return this.retryRequest(this.buildUrl(endpoint), {
      ...this.defaultConfig,
      ...config,
      method: 'DELETE',
    });
  }
}

// Export a default instance
export const httpClient = new HttpClient();

/*****************/
// Basic usage
/*****************/

// Create instance with custom default headers
// const api = new HttpClient('https://api.example.com', {}, {
//   'Authorization': 'Bearer default-token',
//   'Custom-Header': 'default-value'
// });

// Make request with additional headers
// const response = await api.get('/users', {
//   headers: {
//     'Request-ID': '123',
//     'Custom-Header': 'override-value'
//   }
// });

// Update default headers
// api.setDefaultHeaders({
//   'Authorization': 'Bearer new-token'
// });