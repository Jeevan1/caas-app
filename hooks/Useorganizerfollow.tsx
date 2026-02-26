"use client";

// ─── DROP-IN HOOK ─────────────────────────────────────────────────────────────
// Fetches follow status + returns follow/unfollow toggle.
// Usage: const { isFollowing, toggle, isPending } = useOrganizerFollow(organizerId)

import { useState, useEffect } from "react";
import { FOLLOW_QUERY_KEY } from "@/constants";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useApiMutation } from "@/lib/utils";

export function useOrganizerFollow(organizerId: string) {
  const { data: followData, isLoading } = useApiQuery<{
    is_following: boolean;
  }>({
    url: `/api/event/organizer-follows/is-following/?organizer=${organizerId}`,
    queryKey: [...FOLLOW_QUERY_KEY, organizerId],
    enabled: !!organizerId,
  });

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!isLoading && followData !== undefined) {
      setIsFollowing(followData.is_following ?? false);
    }
  }, [followData, isLoading]);

  const { mutateAsync: followMutation, isPending: followPending } =
    useApiMutation({
      apiPath: `/api/event/organizer-follows/`,
      method: "POST",
      queryKey: [...FOLLOW_QUERY_KEY, organizerId],
      successMessage: "Following!",
    });

  const { mutateAsync: unfollowMutation, isPending: unfollowPending } =
    useApiMutation({
      apiPath: `/api/event/organizer-follows/unfollow/`,
      method: "POST",
      queryKey: [...FOLLOW_QUERY_KEY, organizerId],
      successMessage: "Unfollowed",
    });

  const isPending = followPending || unfollowPending;

  async function toggle() {
    if (isPending) return;
    // Optimistic update
    setIsFollowing((prev) => !prev);
    try {
      if (isFollowing) {
        await unfollowMutation({ organizer: organizerId });
      } else {
        await followMutation({ organizer: organizerId });
      }
    } catch {
      // Revert on error
      setIsFollowing((prev) => !prev);
    }
  }

  return { isFollowing, toggle, isPending, isLoading };
}
