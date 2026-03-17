import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Article, ArticleListResponse, CreateArticleRequest, ErrorResponse, HealthStatus, ListArticlesParams, NewsletterSubscribeRequest, ParsedArticleResponse, SuccessResponse, UpdateArticleRequest, UploadContentRequest } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all published articles
 */
export declare const getListArticlesUrl: (params?: ListArticlesParams) => string;
export declare const listArticles: (params?: ListArticlesParams, options?: RequestInit) => Promise<ArticleListResponse>;
export declare const getListArticlesQueryKey: (params?: ListArticlesParams) => readonly ["/api/articles", ...ListArticlesParams[]];
export declare const getListArticlesQueryOptions: <TData = Awaited<ReturnType<typeof listArticles>>, TError = ErrorType<unknown>>(params?: ListArticlesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listArticles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listArticles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListArticlesQueryResult = NonNullable<Awaited<ReturnType<typeof listArticles>>>;
export type ListArticlesQueryError = ErrorType<unknown>;
/**
 * @summary List all published articles
 */
export declare function useListArticles<TData = Awaited<ReturnType<typeof listArticles>>, TError = ErrorType<unknown>>(params?: ListArticlesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listArticles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new article (admin)
 */
export declare const getCreateArticleUrl: () => string;
export declare const createArticle: (createArticleRequest: CreateArticleRequest, options?: RequestInit) => Promise<Article>;
export declare const getCreateArticleMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createArticle>>, TError, {
        data: BodyType<CreateArticleRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createArticle>>, TError, {
    data: BodyType<CreateArticleRequest>;
}, TContext>;
export type CreateArticleMutationResult = NonNullable<Awaited<ReturnType<typeof createArticle>>>;
export type CreateArticleMutationBody = BodyType<CreateArticleRequest>;
export type CreateArticleMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create a new article (admin)
 */
export declare const useCreateArticle: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createArticle>>, TError, {
        data: BodyType<CreateArticleRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createArticle>>, TError, {
    data: BodyType<CreateArticleRequest>;
}, TContext>;
/**
 * @summary Get a single article
 */
export declare const getGetArticleUrl: (id: number) => string;
export declare const getArticle: (id: number, options?: RequestInit) => Promise<Article>;
export declare const getGetArticleQueryKey: (id: number) => readonly [`/api/articles/${number}`];
export declare const getGetArticleQueryOptions: <TData = Awaited<ReturnType<typeof getArticle>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getArticle>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getArticle>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetArticleQueryResult = NonNullable<Awaited<ReturnType<typeof getArticle>>>;
export type GetArticleQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a single article
 */
export declare function useGetArticle<TData = Awaited<ReturnType<typeof getArticle>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getArticle>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update an article (admin)
 */
export declare const getUpdateArticleUrl: (id: number) => string;
export declare const updateArticle: (id: number, updateArticleRequest: UpdateArticleRequest, options?: RequestInit) => Promise<Article>;
export declare const getUpdateArticleMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateArticle>>, TError, {
        id: number;
        data: BodyType<UpdateArticleRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateArticle>>, TError, {
    id: number;
    data: BodyType<UpdateArticleRequest>;
}, TContext>;
export type UpdateArticleMutationResult = NonNullable<Awaited<ReturnType<typeof updateArticle>>>;
export type UpdateArticleMutationBody = BodyType<UpdateArticleRequest>;
export type UpdateArticleMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update an article (admin)
 */
export declare const useUpdateArticle: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateArticle>>, TError, {
        id: number;
        data: BodyType<UpdateArticleRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateArticle>>, TError, {
    id: number;
    data: BodyType<UpdateArticleRequest>;
}, TContext>;
/**
 * @summary Delete an article (admin)
 */
export declare const getDeleteArticleUrl: (id: number) => string;
export declare const deleteArticle: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteArticleMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteArticle>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteArticle>>, TError, {
    id: number;
}, TContext>;
export type DeleteArticleMutationResult = NonNullable<Awaited<ReturnType<typeof deleteArticle>>>;
export type DeleteArticleMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete an article (admin)
 */
export declare const useDeleteArticle: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteArticle>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteArticle>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Upload HTML or raw text content to auto-generate an article
 */
export declare const getUploadArticleContentUrl: () => string;
export declare const uploadArticleContent: (uploadContentRequest: UploadContentRequest, options?: RequestInit) => Promise<ParsedArticleResponse>;
export declare const getUploadArticleContentMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadArticleContent>>, TError, {
        data: BodyType<UploadContentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadArticleContent>>, TError, {
    data: BodyType<UploadContentRequest>;
}, TContext>;
export type UploadArticleContentMutationResult = NonNullable<Awaited<ReturnType<typeof uploadArticleContent>>>;
export type UploadArticleContentMutationBody = BodyType<UploadContentRequest>;
export type UploadArticleContentMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Upload HTML or raw text content to auto-generate an article
 */
export declare const useUploadArticleContent: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadArticleContent>>, TError, {
        data: BodyType<UploadContentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadArticleContent>>, TError, {
    data: BodyType<UploadContentRequest>;
}, TContext>;
/**
 * @summary Subscribe to newsletter
 */
export declare const getSubscribeNewsletterUrl: () => string;
export declare const subscribeNewsletter: (newsletterSubscribeRequest: NewsletterSubscribeRequest, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getSubscribeNewsletterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof subscribeNewsletter>>, TError, {
        data: BodyType<NewsletterSubscribeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof subscribeNewsletter>>, TError, {
    data: BodyType<NewsletterSubscribeRequest>;
}, TContext>;
export type SubscribeNewsletterMutationResult = NonNullable<Awaited<ReturnType<typeof subscribeNewsletter>>>;
export type SubscribeNewsletterMutationBody = BodyType<NewsletterSubscribeRequest>;
export type SubscribeNewsletterMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Subscribe to newsletter
 */
export declare const useSubscribeNewsletter: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof subscribeNewsletter>>, TError, {
        data: BodyType<NewsletterSubscribeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof subscribeNewsletter>>, TError, {
    data: BodyType<NewsletterSubscribeRequest>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map