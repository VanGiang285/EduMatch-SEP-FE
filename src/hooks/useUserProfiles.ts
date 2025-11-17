import { useState, useEffect, useCallback } from 'react';
import { UserProfileService } from '@/services/userProfileService';
import { UserProfileDto, UserDto } from '@/types/backend';
import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';

interface UserProfileCache {
  [email: string]: {
    profile: UserProfileDto;
    userName?: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserProfiles() {
  const [profiles, setProfiles] = useState<UserProfileCache>({});

  const getUserProfile = useCallback(async (email: string): Promise<{ profile: UserProfileDto; userName?: string } | null> => {
    // Check cache first
    const cached = profiles[email];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { profile: cached.profile, userName: cached.userName };
    }

    try {
      const response = await UserProfileService.getUserProfile(email);
      if (response.success && response.data) {
        // Extract userName from userEmailNavigation
        const userName = response.data.userEmailNavigation?.userName;
        const result = {
          profile: response.data,
          userName: userName && userName.trim() !== '' ? userName : undefined,
        };
        setProfiles(prev => ({
          ...prev,
          [email]: {
            profile: response.data!,
            userName: result.userName,
            timestamp: Date.now(),
          },
        }));
        return result;
      }
    } catch (error) {
      console.error(`Failed to fetch user profile for ${email}:`, error);
    }

    return null;
  }, [profiles]);

  const getUserProfiles = useCallback(async (emails: string[]): Promise<Map<string, UserProfileDto>> => {
    const result = new Map<string, UserProfileDto>();
    const emailsToFetch: string[] = [];

    // Check cache for each email
    emails.forEach(email => {
      const cached = profiles[email];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        result.set(email, cached.profile);
      } else {
        emailsToFetch.push(email);
      }
    });

    // Fetch missing profiles
    if (emailsToFetch.length > 0) {
      const fetchPromises = emailsToFetch.map(async (email) => {
        try {
          const response = await UserProfileService.getUserProfile(email);
          if (response.success && response.data) {
            setProfiles(prev => ({
              ...prev,
              [email]: {
                profile: response.data!,
                timestamp: Date.now(),
              },
            }));
            result.set(email, response.data);
          }
        } catch (error) {
          console.error(`Failed to fetch user profile for ${email}:`, error);
        }
      });

      await Promise.all(fetchPromises);
    }

    return result;
  }, [profiles]);

  return { getUserProfile, getUserProfiles };
}

