import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, API_ENDPOINTS } from "../constants/api";
import { STORAGE_KEYS } from "../config/environment";
import { jwtDecode } from "jwt-decode";

// Types
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  errors?: any;
  hasNextPage?: boolean;
  next?: string | null;
  previous?: string | null;
  count?: number;
  token?: string;
  user_type?: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  response?: any;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
}

export interface OtpRequest {
  mobile?: string;
  email?: string;
}

export interface LoginRequest {
  mobile?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  user_type: string;
  first_name: string;
  last_name: string;
  username: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  address1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  document?: any;
  mobile?: string;
  email?: string;
  otp: string;
  password: string;
  confirm_password: string;
}

export interface SignalPostRequest {
  signal_type: string;
  asset: number;
  entry: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  stop_loss?: number;
  caption?: string;
  description?: string;
  is_premium: boolean;
  direction?: string;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Added token expiry check
      if (token) {
        try {
          // Check if token is expired
          const decoded: { exp?: number } = jwtDecode(token);
          if (decoded?.exp) {
            const currentTime = Date.now();
            const expiryTime = decoded.exp * 1000; // Convert to milliseconds
            
            if (currentTime >= expiryTime) {
              console.log("Token expired during API request - triggering logout");
              // Use dynamic import to avoid circular dependency
              const { AuthEvents } = await import('./ApiInterceptor');
              AuthEvents.notifyTokenExpired();
              return null; // Return null to prevent using expired token
            }
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          // Token is invalid, trigger logout
          const { AuthEvents } = await import('./ApiInterceptor');
          AuthEvents.notifyTokenExpired();
          return null;
        }
      }
      
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private createApiError(
    message: string,
    statusCode?: number,
    response?: any,
    isNetworkError = false,
    isTimeoutError = false
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.statusCode = statusCode;
    error.response = response;
    error.isNetworkError = isNetworkError;
    error.isTimeoutError = isTimeoutError;
    return error;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && (error as ApiError).isNetworkError) {
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.RETRY_DELAY)
        );
        return this.retryRequest(requestFn, (retries - 1) as 3);
      }
      throw error;
    }
  }

  private async parseJsonSafe<T>(response: Response): Promise<T | null> {
    // Handle no-content responses
    if (response.status === 204 || response.status === 205) return null;

    // Read as text first
    const raw = await response.text();
    if (!raw) return null; // Empty body

    // Attempt to parse JSON
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw this.createApiError("Invalid JSON from server", response.status, {
        rawPreview: raw.slice(0, 200),
        contentType: response.headers.get("content-type"),
      });
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const url = `${this.baseURL}${endpoint}`;
      const token = await this.getAuthToken();

      const defaultHeaders: HeadersInit = {
        ...API_CONFIG.HEADERS,
      };

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await this.parseJsonSafe<any>(response).catch(
            () => ({})
          );
          throw this.createApiError(
            (errorData && errorData.message) ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData || null
          );
        }

        const data = await this.parseJsonSafe<ApiResponse<T>>(response);
        return data ?? ({} as any);
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw this.createApiError("Request timeout", 408, null, false, true);
        }

        if (
          error.message === "Network request failed" ||
          error.code === "NETWORK_ERROR"
        ) {
          throw this.createApiError("Network error", 0, null, true, false);
        }

        if (error.statusCode !== undefined) {
          throw error;
        }

        console.error("API Request Error:", error);
        throw this.createApiError(
          error.message || "Unknown error occurred",
          0,
          null,
          true,
          false
        );
      }
    });
  }

  private async makeFormDataRequest<T>(
    endpoint: string,
    formData: FormData,
    method: string = "POST"
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    // Don't set content-type for multipart/form-data
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseJsonSafe<any>(response).catch(
          () => ({})
        );
        throw this.createApiError(
          (errorData && errorData.message) ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData || null
        );
      }

      const data = await this.parseJsonSafe<ApiResponse<T>>(response);
      return data ?? ({} as any);
    } catch (error) {
      // console.error("API FormData Request Error:", error);
      throw error;
    }
  }

  async generateOtp(request: OtpRequest): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GENERATE_OTP, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async generateOtpEmail(request: OtpRequest): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GENERATE_OTP_EMAIL, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async verifyOtp(request: OtpRequest): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async register(request: RegisterRequest): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return this.makeFormDataRequest(API_ENDPOINTS.REGISTER, formData);
  }

  async login(request: LoginRequest): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Forgot Password API
  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Reset Password API
  async resetPassword({
    email,
    newPassword,
  }: {
    email: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email, password: newPassword }),
    });
  }

  async superuserLogin(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.SUPERUSER_LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // User Profile APIs
  async getUserProfile(): Promise<ApiResponse> {
    const token = await AsyncStorage.getItem("authToken");

    return this.makeRequest(API_ENDPOINTS.GET_USER_PROFILE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    const formData = new FormData();

    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Check if this is a file object (for profile image)
        if (
          key === "profile_image" &&
          typeof value === "object" &&
          "uri" in value
        ) {
          // For React Native, we need to add this as a special object that gets converted to a file
          // @ts-ignore - This is a React Native specific FormData format for file uploads
          formData.append(key, {
            uri: value.uri,
            name:
              "uri" in value && "name" in value
                ? (value as any).name
                : "image.jpg",
            type:
              "uri" in value && "type" in value
                ? (value as any).type
                : "image/jpeg",
          });
        } else {
          // Append as a regular string
          formData.append(key, String(value));
        }
      }
    });

    return this.makeFormDataRequest(
      API_ENDPOINTS.UPDATE_USER_PROFILE,
      formData,
      "PATCH"
    );
  }

  async getSignalProviderProfile(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_SIGNAL_PROVIDER_PROFILE, {
      method: "GET",
    });
  }

  async updateSignalProviderProfile(profileData: any): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.makeFormDataRequest(
      API_ENDPOINTS.UPDATE_SIGNAL_PROVIDER_PROFILE,
      formData,
      "PATCH"
    );
  }

  // Asset APIs
  async createAsset(name: string): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.CREATE_ASSET, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getAssets(page: number, perPage: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_ASSET}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  async updateAsset(assetId: number, name: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("name", name);

    return this.makeFormDataRequest(
      `${API_ENDPOINTS.UPDATE_ASSET}${assetId}/`,
      formData,
      "PATCH"
    );
  }

  // Follow System APIs
  async followSignalProvider(signalProviderId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.FOLLOW_REQUEST, {
      method: "POST",
      body: JSON.stringify({ signal_provider: signalProviderId }),
    });
  }

  async unfollowSignalProvider(signalProviderId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.UNFOLLOW, {
      method: "POST",
      body: JSON.stringify({ signal_provider: signalProviderId }),
    });
  }

  // get user following
  async getUserFollowing(page: number, perPage: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.USER_FOLLOWING}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // get blocked agents by user
  async getAgentBlocked(page: number, perPage: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.USER_BLOCKED_AGENT}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  //Get User By Search
  async getUsersListSearch(
    query: string,
    page: number,
    perPage: number
  ): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.USER_LIST_SEARCH}?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  //Get User By Id
  async getUserProfileById(userId: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.USER_LIST_SEARCH}?user_id=${encodeURIComponent(userId)}`,
      {
        method: "GET",
      }
    );
  }

  // Get All Users
  async getAllUsers(page: number, perPage: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.USER_LIST_SEARCH}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // User Block & Unblock Signal Provider
  async userBlockUnblockSignalProvider(
    signalProviderId: number
  ): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.USER_BLOCKED_AGENT, {
      method: "POST",
      body: JSON.stringify({ signal_provider: signalProviderId }),
    });
  }

  // Signal Provider Blocked/Unblock Users
  async signalProviderBlockedUsers(userId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.AGENT_BLOCKED_USERS, {
      method: "POST",
      body: JSON.stringify({ user: userId }),
    });
  }

  // User Report Signal Provider
  async userReportSignalProvider(
    signalProviderId: number
    // reason: string
  ): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.USER_REPORT_SIGNAL_PROVIDER, {
      method: "POST",
      body: JSON.stringify({
        signal_provider: signalProviderId,
        // reason,
      }),
    });
  }

  // Signal Provider Report User
  async signalProviderReportUser(
    userId: number
    // reason: string
  ): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.SIGNAL_PROVIDER_REPORT_USER, {
      method: "POST",
      body: JSON.stringify({
        user: userId,
        // reason,
      }),
    });
  }

  // Report Signal Provider Post
  async reportSignalProviderPost(
    postId: number
    // reason: string
  ): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.REPORT_SIGNAL_PROVIDER_POST, {
      method: "POST",
      body: JSON.stringify({
        post: postId,
        // reason,
      }),
    });
  }

  // Search Signal Providers
  async getSignalProviderListSearch(
    query: string,
    page: number,
    perPage: number
  ): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.SIGNAL_PROVIDER_LIST_SEARCH}?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // Get All Signal Providers
  async getAllSignalProviders(
    page: number,
    perPage: number
  ): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.SIGNAL_PROVIDER_LIST_SEARCH}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // Get Singal Provider Profile by ID
  async getSignalProviderProfileById(
    signalProviderId: number
  ): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.SIGNAL_PROVIDER_LIST_SEARCH}?signal_provider_id=${encodeURIComponent(signalProviderId)}`,
      {
        method: "GET",
      }
    );
  }

  async getSignalProviderFollowers({
    page,
    perPage,
  }: {
    page: number;
    perPage: number;
  }): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.SIGNAL_PROVIDER_FOLLOWERS}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // Signal Post APIs
  async createSignalPost(request: SignalPostRequest): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.makeFormDataRequest(API_ENDPOINTS.CREATE_SIGNAL_POST, formData);
  }

  async getAllSignalPosts({
    page,
    perPage,
  }: {
    page: number;
    perPage: number;
  }): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_ALL_SIGNAL_POSTS}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  async getAssetBasedSignalPosts({
    asset_id,
  }: {
    asset_id: number;
  }): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.ASSET_BASED_SIGNAL_POSTS}?asset_id=${asset_id}`,
      {
        method: "GET",
      }
    );
  }

  // Get Own Signal Posts
  async getOwnSignalPosts({
    page,
    perPage,
  }: {
    page: number;
    perPage: number;
  }): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_SIGNAL_OWN_POSTS}?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
      }
    );
  }

  // Like and Comment APIs
  async likePost(postId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.LIKE_POST, {
      method: "POST",
      body: JSON.stringify({ post: postId }),
    });
  }

  // Like and Comment APIs
  async likeGet(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.LIKE_POST, {
      method: "GET",
    });
  }

  // Get Main Comment for Signal Post
  async getMainComment(postId: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_MAIN_COMMENT}?post=${postId}`,
      {
        method: "GET",
      }
    );
  }

  // DisLike and Comment APIs
  async dislikePost(postId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.DISLIKE_POST, {
      method: "POST",
      body: JSON.stringify({ post: postId }),
    });
  }

  async getLikedPosts(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_LIKES, {
      method: "GET",
    });
  }

  async commentOnPost(postId: number, comment: string): Promise<ApiResponse> {
    const body: any = { post: postId, comment };

    return this.makeRequest(API_ENDPOINTS.COMMENT_POST, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async commentOnReplyPost(
    parent: number,
    comment: string
  ): Promise<ApiResponse> {
    const body: any = { parent, comment };

    return this.makeRequest(API_ENDPOINTS.COMMENT_POST, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deleteComment(commentId: number): Promise<ApiResponse> {
    return this.makeRequest(`${API_ENDPOINTS.DELETE_COMMENT}${commentId}/`, {
      method: "DELETE",
    });
  }

  // GET comments reply message
  async getReplyCommentMessage(commentId: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_REPLY_COMMENT_MESSAGE}?comment_id=${commentId}`,
      {
        method: "GET",
      }
    );
  }

  async getPostComments(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_COMMENTS, {
      method: "GET",
    });
  }

  async likeComment(commentId: number): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.LIKE_COMMENT, {
      method: "POST",
      body: JSON.stringify({ comment: commentId }),
    });
  }

  async getCommentLikes(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_COMMENT_LIKES, {
      method: "GET",
    });
  }

  // Subscription Plan APIs
  async getPlanTypes(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_PLAN_TYPES, {
      method: "GET",
    });
  }

  async getSubscriptionPlans(params?: {
    signal_provider?: number;
  }): Promise<ApiResponse> {
    const queryParams = params ? new URLSearchParams() : null;

    if (params?.signal_provider) {
      queryParams?.append("signal_provider", params.signal_provider.toString());
    }

    const url = queryParams
      ? `${API_ENDPOINTS.GET_SUBSCRIPTION_PLANS}?${queryParams.toString()}`
      : API_ENDPOINTS.GET_SUBSCRIPTION_PLANS;

    return this.makeRequest(url, {
      method: "GET",
    });
  }

  async getUserSubscriptions(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.GET_USER_SUBSCRIPTION, {
      method: "GET",
    });
  }

  async getSubscriptionPlanDetail(planId: number): Promise<ApiResponse> {
    return this.makeRequest(
      `${API_ENDPOINTS.GET_SUBSCRIPTION_PLAN_DETAIL}${planId}/`,
      {
        method: "GET",
      }
    );
  }

  // Create Subscription payment
  async useCreateSubscriptionPayment({
    subscription_plan_id,
    signal_provider_id,
    amount,
    currency_code,
    payment_method_id,
  }: {
    subscription_plan_id: number;
    signal_provider_id: number;
    amount: number;
    currency_code: string;
    payment_method_id: string;
  }): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.CREATE_SUBSCRIPTION_API, {
      method: "POST",
      body: JSON.stringify({
        subscription_plan_id,
        signal_provider_id,
        amount,
        currency_code,
        payment_method_id,
      }),
    });
  }

  // Cancel Subscription
  async cancelSubscription({
    subscription_id,
    signal_provider_id,
  }: {
    subscription_id: string;
    signal_provider_id: number;
  }): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.CANCEL_SUBSCRIPTION, {
      method: "POST",
      body: JSON.stringify({
        subscription_id,
        signal_provider_id,
      }),
    });
  }

  // Analytics APIs
  async getSignalSuccessRate(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.SIGNAL_SUCCESS_RATE, {
      method: "GET",
    });
  }

  async getMonthlyProfitAnalysis(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.MONTHLY_PROFIT_ANALYSIS, {
      method: "GET",
    });
  }

  // Notification APIs
  async getNotifications(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATIONS, {
      method: "GET",
    });
  }

  async getNotificationCount(): Promise<ApiResponse> {
    return this.makeRequest(API_ENDPOINTS.NOTIFICATION_COUNT, {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
