import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiService, {
  ApiResponse,
  OtpRequest,
  LoginRequest,
  RegisterRequest,
  SignalPostRequest,
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/environment";

// Query Keys
export const QUERY_KEYS = {
  USER_PROFILE: "userProfile",
  SIGNAL_PROVIDER_PROFILE: "signalProviderProfile",
  ASSETS: "assets",
  SIGNAL_POSTS: "signalPosts",
  SIGNAL_OWN_POSTS: "signalOwnPosts",
  USER_FOLLOWING: "userFollowing",
  USER_BLOCKED: "userBlocked",
  USER_LIST_SEARCH: "userListSearch",
  SIGNAL_PROVIDER_FOLLOWERS: "signalProviderFollowers",
  SIGNAL_PROVIDER_LIST_SEARCH: "signalProviderListSearch",
  LIKED_POSTS: "likedPosts",
  POST_COMMENTS: "postComments",
  GET_REPLY_COMMENT_MESSAGE: "getReplyCommentMessage",
  COMMENT_LIKES: "commentLikes",
  PLAN_TYPES: "planTypes",
  SUBSCRIPTION_PLANS: "subscriptionPlans",
  SIGNAL_SUCCESS_RATE: "signalSuccessRate",
  MONTHLY_PROFIT_ANALYSIS: "monthlyProfitAnalysis",
  NOTIFICATIONS: "notifications",
  NOTIFICATION_COUNT: "notificationCount",
} as const;

// Authentication Hooks
export const useGenerateOtp = () => {
  return useMutation({
    mutationFn: (request: OtpRequest) => apiService.generateOtp(request),
  });
};

export const useGenerateOtpEmail = () => {
  return useMutation({
    mutationFn: (request: OtpRequest) => apiService.generateOtpEmail(request),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (request: RegisterRequest) => apiService.register(request),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => apiService.login(request),
    onSuccess: async (data) => {
      if (data.token) {
        // await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);

        if (data.user_type) {
          // await AsyncStorage.setItem("userType", data.user_type);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, data.user_type);
        }
        queryClient.invalidateQueries();
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear AsyncStorage items using STORAGE_KEYS
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_TYPE,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      // Clear all queries and cache
      queryClient.clear();

      // Return success response
      return { success: true };
    },
    onSuccess: () => {
      // Additional cleanup if needed
      console.log("Logout successful - all data cleared");
    },
    onError: (error) => {
      // console.error("Logout failed:", error);
      throw error;
    },
  });
};

// User Profile Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE],
    queryFn: () => apiService.getUserProfile(),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: any) => apiService.updateUserProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE] });
    },
  });
};

export const useSignalProviderProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_PROFILE],
    queryFn: () => apiService.getSignalProviderProfile(),
  });
};

export const useUpdateSignalProviderProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: any) =>
      apiService.updateSignalProviderProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_PROFILE],
      });
    },
  });
};

// Asset Hooks
// export const useAssets = () => {
//   return useQuery({
//     queryKey: [QUERY_KEYS.ASSETS],
//     queryFn: () => apiService.getAssets(),
//   });
// };

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiService.createAsset(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSETS] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, name }: { assetId: number; name: string }) =>
      apiService.updateAsset(assetId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSETS] });
    },
  });
};

// Follow System Hooks
export const useFollowSignalProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signalProviderId: number) =>
      apiService.followSignalProvider(signalProviderId),
    onSuccess: (_, signalProviderId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_FOLLOWING] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
      //! new query to refresh user profile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PROFILE],
      });
      // Invalidate this specific signal provider profile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_PROFILE, signalProviderId],
      });
    },
  });
};

export const useUnfollowSignalProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signalProviderId: number) =>
      apiService.unfollowSignalProvider(signalProviderId),
    onSuccess: (_, signalProviderId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_FOLLOWING] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
      //! new query to refresh user profile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PROFILE],
      });
      // Invalidate this specific signal provider profile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_PROFILE, signalProviderId],
      });
    },
  });
};

//get all users by search
export const useUsersListSearch = (
  searchTerm: string,
  options: { enabled?: boolean; page?: number; perPage?: number } = {}
) => {
  const queryClient = useQueryClient();
  const { enabled = true, page = 1, perPage = 10 } = options;

  const queryKey = [
    QUERY_KEYS.USER_LIST_SEARCH,
    searchTerm || "all",
    page,
    perPage,
  ];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      searchTerm
        ? apiService.getUsersListSearch(searchTerm, page, perPage)
        : apiService.getAllUsers(page, perPage),
    enabled,
    staleTime: 1000 * 60 * 2, // always considered stale (forces fetch)
    // staleTime: 0, // always considered stale (forces fetch)
  });

  const forceRefetch = () => {
    return queryClient.invalidateQueries({ queryKey, refetchType: "active" });
  };

  return {
    ...query,
    refetch: forceRefetch, // override default with forced refetch
  };
};

// User Block/Unblock Signal Provider
export const useBlockUnblockSignalProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signalProviderId: number) =>
      apiService.userBlockUnblockSignalProvider(signalProviderId),
    // QUERY_KEYS.USER_PROFILE
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BLOCKED] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
      //! new query to refresh user profile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_PROFILE],
      });
    },
  });
};

// Signal Provider Blocked/Unblock Users
export const useSignalProviderBlockedUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signalProviderId: number) =>
      apiService.signalProviderBlockedUsers(signalProviderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BLOCKED] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
      //! new query to refresh user profile
      // queryClient.invalidateQueries({
      //   queryKey: [QUERY_KEYS.USER_PROFILE],
      // });
    },
  });
};

// User Report Signal Provider
export const useUserReportSignalProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signalProviderId: number) =>
      apiService.userReportSignalProvider(signalProviderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BLOCKED] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
    },
  });
};

// Signal Provider Report User
export const useSignalProviderReportUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => apiService.signalProviderReportUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_BLOCKED] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS],
      });
    },
  });
};

// Report Signal Provider Post
export const useReportSignalProviderPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }: { postId: number }) =>
      apiService.reportSignalProviderPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SIGNAL_POSTS] });
    },
  });
};

// Get User By Id
export const useUserProfileById = (userId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, userId],
    queryFn: () => apiService.getUserProfileById(userId),
    enabled: !!userId, // Only run if userId is provided
  });
};

// get signal provider followers
export const useSignalProviderFollowers = ({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_FOLLOWERS, page, perPage],
    queryFn: () => apiService.getSignalProviderFollowers({ page, perPage }),
  });
};

export const useSignalProviderListSearch = (
  searchTerm: string,
  options: { enabled?: boolean; page?: number; perPage?: number } = {}
) => {
  const { enabled = true, page = 1, perPage = 10 } = options;
  const queryClient = useQueryClient();

  const queryKey = [
    QUERY_KEYS.SIGNAL_PROVIDER_LIST_SEARCH,
    searchTerm || "all",
    page,
    perPage,
  ];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      searchTerm
        ? apiService.getSignalProviderListSearch(searchTerm, page, perPage)
        : apiService.getAllSignalProviders(page, perPage),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const forceRefetch = () =>
    queryClient.invalidateQueries({
      queryKey,
      refetchType: "active",
    });

  return {
    ...query,
    refetch: forceRefetch,
  };
};

// Get Signal Provider By Id
export const useSignalProviderProfileById = (signalProviderId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_PROVIDER_PROFILE, signalProviderId],
    queryFn: () => apiService.getSignalProviderProfileById(signalProviderId),
    enabled: !!signalProviderId, // Only run if signalProviderId is provided
  });
};

// Signal Post Hooks
export const useAllSignalPosts = ({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) => {
  // This hook fetches all signal posts
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_POSTS, page, perPage],
    queryFn: () => apiService.getAllSignalPosts({ page, perPage }),
  });
};

export const useOwnSignalPosts = ({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_OWN_POSTS, page, perPage],
    queryFn: () => apiService.getOwnSignalPosts({ page, perPage }),
  });
};

export const useCreateSignalPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SignalPostRequest) =>
      apiService.createSignalPost(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SIGNAL_POSTS] });
    },
  });
};

// Like and Comment Hooks
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => apiService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LIKED_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SIGNAL_POSTS] });
    },
  });
};

export const useLikedPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.LIKED_POSTS],
    queryFn: () => apiService.getLikedPosts(),
  });
};

// Get Signal Post Comments
export const useGetSignalPostComments = (postId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.POST_COMMENTS, postId],
    queryFn: () => apiService.getMainComment(postId),
    enabled: !!postId, // Only run if postId is provided
  });
};

// Comment Signal Provider Post
export const useCommentOnPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, comment }: { postId: number; comment: string }) =>
      apiService.commentOnPost(postId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST_COMMENTS] });
    },
  });
};

// Reply to Comment
export const useCreateReplyToComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parent, comment }: { parent: number; comment: string }) =>
      apiService.commentOnReplyPost(parent, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST_COMMENTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REPLY_COMMENT_MESSAGE],
      });
    },
  });
};

// Get Comments reply message
export const useGetReplyCommentMessage = (commentId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_REPLY_COMMENT_MESSAGE, commentId],
    queryFn: () => apiService.getReplyCommentMessage(commentId),
    enabled: !!commentId, // Only run if commentId is provided
  });
};

export const usePostComments = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.POST_COMMENTS],
    queryFn: () => apiService.getPostComments(),
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number }) =>
      apiService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMMENT_LIKES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST_COMMENTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REPLY_COMMENT_MESSAGE],
      });
    },
  });
};

// Delete Comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number }) =>
      apiService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POST_COMMENTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REPLY_COMMENT_MESSAGE],
      });
    },
  });
};

export const useCommentLikes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.COMMENT_LIKES],
    queryFn: () => apiService.getCommentLikes(),
  });
};

// Subscription Plan Hooks
export const usePlanTypes = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PLAN_TYPES],
    queryFn: () => apiService.getPlanTypes(),
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTION_PLANS],
    queryFn: () => apiService.getSubscriptionPlans(),
  });
};

export const useSubscriptionPlanDetail = (planId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTION_PLANS, planId],
    queryFn: () => apiService.getSubscriptionPlanDetail(planId),
    enabled: !!planId,
  });
};

// Analytics Hooks
// ! Note: These hooks also get agent profile data
export const useSignalSuccessRate = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SIGNAL_SUCCESS_RATE],
    queryFn: () => apiService.getSignalSuccessRate(),
  });
};

export const useMonthlyProfitAnalysis = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.MONTHLY_PROFIT_ANALYSIS],
    queryFn: () => apiService.getMonthlyProfitAnalysis(),
  });
};

// Notification Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: () => apiService.getNotifications(),
  });
};

export const useNotificationCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION_COUNT],
    queryFn: () => apiService.getNotificationCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
