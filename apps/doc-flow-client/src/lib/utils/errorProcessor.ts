import { toast } from 'sonner';
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

// Specific error messages for common scenarios
const SPECIFIC_ERROR_MESSAGES: Record<string, string> = {
  'Presence already exists': 'Você já está registrado neste evento',
  'Event not found': 'Evento não encontrado',
  'User not found': 'Usuário não encontrado',
  'Invalid credentials': 'Email ou senha incorretos',
  'Token expired': 'Sua sessão expirou. Faça login novamente',
  'Insufficient permissions': 'Você não tem permissão para esta ação',
  'Validation failed': 'Dados inválidos fornecidos',
  'Duplicate entry': 'Registro já existe',
  'Resource limit exceeded': 'Limite de recursos excedido'
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

    // Handle API error responses
    if (error.response?.data) {
      const apiError = error.response.data as ApiError;
      const status = apiError.status || error.response.status;
      const errorTemplate = ERROR_MESSAGES[status];
      
      if (errorTemplate) {
        const errorMessage = this.extractErrorMessage(apiError);
        
        return {
          type: errorTemplate.type,
          severity: errorTemplate.severity,
          title: errorTemplate.title,
          message: errorMessage || errorTemplate.message,
          details: Array.isArray(apiError.error) ? apiError.error : apiError.message ? 
            (Array.isArray(apiError.message) ? apiError.message : [apiError.message]) : undefined,
          canRetry: status >= 500 || status === 429, // Server errors and rate limits
          context
        };
      }
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

  private static extractErrorMessage(apiError: ApiError): string | undefined {
    // Check for specific known error messages
    const errorText = typeof apiError.error === 'string' ? apiError.error : 
      Array.isArray(apiError.error) ? apiError.error[0] : '';
    
    if (errorText && SPECIFIC_ERROR_MESSAGES[errorText]) {
      return SPECIFIC_ERROR_MESSAGES[errorText];
    }

    // Check message field
    if (apiError.message) {
      const messageText = Array.isArray(apiError.message) ? apiError.message[0] : apiError.message;
      if (SPECIFIC_ERROR_MESSAGES[messageText]) {
        return SPECIFIC_ERROR_MESSAGES[messageText];
      }
    }

    // Return original error if no specific mapping found
    return errorText || (Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message);
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

  static showErrorToast(error: ErrorInput, context?: ErrorContext): ProcessedError {
    const processedError = this.handleError(error, context);
    
    // Show toast based on severity
    switch (processedError.severity) {
      case ErrorSeverity.INFO:
        toast.info(processedError.message, {
          description: processedError.details?.join(', ')
        });
        break;
      case ErrorSeverity.WARNING:
        toast.warning(processedError.message, {
          description: processedError.details?.join(', ')
        });
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        toast.error(processedError.message, {
          description: processedError.details?.join(', '),
          duration: processedError.severity === ErrorSeverity.CRITICAL ? 10000 : 5000
        });
        break;
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