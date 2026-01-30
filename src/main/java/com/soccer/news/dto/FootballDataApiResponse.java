package com.soccer.news.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Football-Data.org API レスポンスDTO
 * /v4/competitions/{league}/scorers エンドポイント用
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FootballDataApiResponse {
    
    @JsonProperty("count")
    private Integer count;
    
    @JsonProperty("filters")
    private Filters filters;
    
    @JsonProperty("competition")
    private Competition competition;
    
    @JsonProperty("season")
    private Season season;
    
    @JsonProperty("scorers")
    private List<Scorer> scorers;
    
    // Team Squad API用のフィールド
    @JsonProperty("squad")
    private List<SquadMember> squad;
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Filters {
        @JsonProperty("limit")
        private Integer limit;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Competition {
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("code")
        private String code;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("emblem")
        private String emblem;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Season {
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("startDate")
        private String startDate;
        
        @JsonProperty("endDate")
        private String endDate;
        
        @JsonProperty("currentMatchday")
        private Integer currentMatchday;
        
        @JsonProperty("winner")
        private Object winner;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Scorer {
        @JsonProperty("player")
        private Player player;
        
        @JsonProperty("team")
        private Team team;
        
        @JsonProperty("playedMatches")
        private Integer playedMatches;
        
        @JsonProperty("goals")
        private Integer goals;
        
        @JsonProperty("assists")
        private Integer assists;
        
        @JsonProperty("penalties")
        private Integer penalties;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Player {
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("firstName")
        private String firstName;
        
        @JsonProperty("lastName")
        private String lastName;
        
        @JsonProperty("dateOfBirth")
        private String dateOfBirth;
        
        @JsonProperty("nationality")
        private String nationality;
        
        @JsonProperty("position")
        private String position;
        
        @JsonProperty("shirtNumber")
        private Integer shirtNumber;
        
        @JsonProperty("lastUpdated")
        private String lastUpdated;
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Team {
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("shortName")
        private String shortName;
        
        @JsonProperty("tla")
        private String tla;
        
        @JsonProperty("crest")
        private String crest;
        
        @JsonProperty("address")
        private String address;
        
        @JsonProperty("website")
        private String website;
        
        @JsonProperty("founded")
        private Integer founded;
        
        @JsonProperty("clubColors")
        private String clubColors;
        
        @JsonProperty("venue")
        private String venue;
        
        @JsonProperty("lastUpdated")
        private String lastUpdated;
    }
    
    /**
     * Team Squad API用のDTO
     * /v4/teams/{teamId} エンドポイントのsquad配列用
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SquadMember {
        @JsonProperty("id")
        private Integer id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("position")
        private String position;
        
        @JsonProperty("dateOfBirth")
        private String dateOfBirth;
        
        @JsonProperty("nationality")
        private String nationality;
        
        @JsonProperty("shirtNumber")
        private Integer shirtNumber;
    }
}
