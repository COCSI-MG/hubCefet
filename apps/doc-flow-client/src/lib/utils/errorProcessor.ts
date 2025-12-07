import {
  ApiError,
  ErrorType,
  ErrorSeverity,
  ProcessedError,
  ErrorContext
} from '@/lib/types/errors';

// Error messages mapping for user-friendly display
const ERROR_MESSAGES: Record<number, { title: string; message: string; type: ErrorType; severity: ErrorSeverity }> = {
  400: {
    title: 'Dados Inválidos',
    message: 'Verifique as informações fornecidas e tente novamente',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.WARNING
  },
  401: {
    title: 'Acesso Negado',
    message: 'Você precisa fazer login para acessar este recurso',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.ERROR
  },
  403: {
    title: 'Sem Permissão',
    message: 'Você não tem permissão para realizar esta ação',
    type: ErrorType.AUTHORIZATION,
    severity: ErrorSeverity.ERROR
  },
  404: {
    title: 'Não Encontrado',
    message: 'O recurso solicitado não foi encontrado',
    type: ErrorType.NOT_FOUND,
    severity: ErrorSeverity.WARNING
  },
  409: {
    title: 'Conflito',
    message: 'Esta ação entra em conflito com dados existentes',
    type: ErrorType.CONFLICT,
    severity: ErrorSeverity.WARNING
  },
  422: {
    title: 'Dados Inválidos',
    message: 'Os dados fornecidos não puderam ser processados',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.WARNING
  },
  500: {
    title: 'Erro no Servidor',
    message: 'Ocorreu um erro interno. Tente novamente mais tarde',
    type: ErrorType.SERVER,
    severity: ErrorSeverity.ERROR
  },
  502: {
    title: 'Servidor Indisponível',
    message: 'O servidor está temporariamente indisponível',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.ERROR
  },
  503: {
    title: 'Serviço Indisponível',
    message: 'O serviço está temporariamente fora do ar',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.ERROR
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorInput = any;

export class ErrorProcessor {
  static processError(error: ErrorInput, context?: ErrorContext): ProcessedError {
    // Handle network errors
    if (!error.response && error.request) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.ERROR,
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        canRetry: true,
        context
      };
    }

    const data = error.response.data

    if (data) {
      const apiError = data as ApiError;
      const status = apiError.status || error.response.status;
      const errorTemplate = ERROR_MESSAGES[status];

      const errorMessage = apiError.error || errorTemplate.message || 'Erro desconhecido';

      return {
        type: errorTemplate.type,
        severity: errorTemplate.severity,
        title: errorTemplate.title,
        message: errorMessage,
        details: [apiError.error],
        canRetry: status >= 500 || status === 429, // Server errors and rate limits
        context
      };
    }

    // Handle unknown errors
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      title: 'Erro Inesperado',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
      context
    };
  }

  static handleError(error: ErrorInput, context?: ErrorContext): ProcessedError {
    const processedError = this.processError(error, context);

    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.group('🚨 Error Handled');
      console.error('Original Error:', error);
      console.log('Processed Error:', processedError);
      console.log('Context:', context);
      console.groupEnd();
    }

    return processedError;
  }

  static createRetryableError(
    message: string,
    retryAction: () => void,
    context?: ErrorContext
  ): ProcessedError {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.WARNING,
      title: 'Erro Temporário',
      message,
      canRetry: true,
      retryAction,
      context
    };
  }
}
