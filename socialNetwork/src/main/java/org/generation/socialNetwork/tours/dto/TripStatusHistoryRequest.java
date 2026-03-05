package org.generation.socialNetwork.tours.dto;

import org.generation.socialNetwork.tours.model.TripStatus;

public class TripStatusHistoryRequest {

    private Long tripId;
    private TripStatus oldStatus;
    private TripStatus newStatus;
    private String reason;
    private Long changedByUserId;

    // Getters y Setters
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public TripStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(TripStatus oldStatus) { this.oldStatus = oldStatus; }

    public TripStatus getNewStatus() { return newStatus; }
    public void setNewStatus(TripStatus newStatus) { this.newStatus = newStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(Long changedByUserId) { this.changedByUserId = changedByUserId; }
}
