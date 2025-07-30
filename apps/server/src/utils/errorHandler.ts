export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public context?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export class OneInchError extends APIError {
  constructor(message: string, statusCode = 500, context?: Record<string, any>) {
    super(statusCode, `1inch API Error: ${message}`, true, context);
  }
}

export class BridgeError extends APIError {
  constructor(message: string, statusCode = 500, context?: Record<string, any>) {
    super(statusCode, `Bridge Error: ${message}`, true, context);
  }
}

export const errorHandler = {
  handleOneInchError(error: any): APIError {
    if (error.response?.status === 429) {
      return new OneInchError('Rate limit exceeded', 429);
    }
    if (error.response?.status === 400) {
      return new OneInchError(error.response.data?.message || 'Invalid request', 400);
    }
    if (error.response?.status === 401) {
      return new OneInchError('API key invalid or missing', 401);
    }
    if (error.code === 'ECONNABORTED') {
      return new OneInchError('Request timeout', 408);
    }
    return new OneInchError(error.message || 'Unknown error', 500);
  },

  handleBridgeError(error: any): APIError {
    if (error.message.includes('insufficient funds')) {
      return new BridgeError('Insufficient funds for bridge operation', 400);
    }
    if (error.message.includes('slippage')) {
      return new BridgeError('Bridge slippage too high', 400);
    }
    return new BridgeError(error.message || 'Unknown bridge error', 500);
  },

  handleValidationError(error: any): APIError {
    return new APIError(400, 'Validation Error: ' + error.message);
  }
};
