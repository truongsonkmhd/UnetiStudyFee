package com.truongsonkmhd.unetistudy.utils;

import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

@Component
public class CacheUtil {

    CacheManager cacheManager;
    UserRepository userRepository;

    // cache thông tin user;
    private final String All_User_Key = "All_User";
    public Map<UUID, User> getMapAllUsers(){
        Cache cache = cacheManager.getCache(this.getClass().getName());
        if(cache != null){
            Cache.ValueWrapper valueWrapper = cache.get(All_User_Key);
            if(valueWrapper != null){
                return  (Map<UUID, User>) valueWrapper.get();
            }
        }
        Map<UUID, User> result = this.userRepository.findAll().stream().collect(Collectors.toMap(ele -> ele.getId(), ele -> ele));
        if(cache != null){
            cache.put(All_User_Key, result);
        }
        return result;
    }
    // cached danh sách token và User tương ứng
    private final String MAP_Token_UserDetail = "MAP_Token_UserDetail";

    public Map<String, UserDetails> getMapTokenUserDetail(){
        Cache cache = cacheManager.getCache(this.getClass().getName());
        if(cache != null){
            Cache.ValueWrapper valueWrapper = cache.get(this.MAP_Token_UserDetail);
            if(valueWrapper != null){
                return  (Map<String, UserDetails>) valueWrapper.get();
            }
        }
        Map<String, UserDetails> mapTokenUserDetail = new HashMap<>();
        if(cache != null){
            cache.put(this.MAP_Token_UserDetail, mapTokenUserDetail);
        }
        return mapTokenUserDetail;
    }

    // ham update cached cho MAP_Token_UserDetail
    public void updateMapTokenUserDetail(String token, UserDetails userDetails){
        try {
            Cache cache = cacheManager.getCache(this.getClass().getName());
            if(cache != null){
                Cache.ValueWrapper valueWrapper = cache.get(this.MAP_Token_UserDetail);
                if(valueWrapper != null){
                    Map<String, UserDetails> mapTokenUserDetail = (Map<String, UserDetails>) valueWrapper.get();
                    if(mapTokenUserDetail != null){
                        mapTokenUserDetail.put(token, userDetails);
                        cache.put(this.MAP_Token_UserDetail, mapTokenUserDetail);
                    }
                }
            }
        }catch (Exception ex){
        }
    }
}
