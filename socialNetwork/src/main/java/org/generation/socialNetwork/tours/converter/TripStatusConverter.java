package org.generation.socialNetwork.tours.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.generation.socialNetwork.tours.model.TripStatus;

@Converter(autoApply = true)
public class TripStatusConverter implements AttributeConverter<TripStatusConverter, String> {

    @Override
    public String convertToDatabaseColumn(TripStatusConverter status) {
        if (status == null) return null;
        return status.equals();
    }

    @Override
    public TripStatusConverter convertToEntityAttribute(String value) {
        if (value == null) return null;
        return TripStatusConverter.fromValue(value);
    }
}