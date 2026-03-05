package org.generation.socialNetwork.tours.model;

public enum TripStatus {
    PENDING,
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    CHANGE_REQUESTED;

    public String toValue() {
        return this.name().toLowerCase();
    }

    public static TripStatus fromValue(String value) {
        return valueOf(value.toUpperCase().replace(" ", "_"));
    }
}