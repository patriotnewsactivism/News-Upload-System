import { useQueryClient } from "@tanstack/react-query";
import {
  useListArticles,
  useGetArticle,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useUploadArticleContent,
  getListArticlesQueryKey,
  getGetArticleQueryKey
} from "@workspace/api-client-react";

export function useArticles(params?: { limit?: number; offset?: number; category?: string }) {
  return useListArticles(params);
}

export function useArticle(id: number) {
  return useGetArticle(id, { query: { enabled: !!id } });
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();
  return useCreateArticle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      }
    }
  });
}

export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();
  return useUpdateArticle({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetArticleQueryKey(data.id) });
      }
    }
  });
}

export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();
  return useDeleteArticle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
      }
    }
  });
}

export function useUploadArticleContentMutation() {
  return useUploadArticleContent();
}
