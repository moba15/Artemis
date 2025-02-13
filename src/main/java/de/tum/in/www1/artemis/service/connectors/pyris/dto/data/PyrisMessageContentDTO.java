package de.tum.in.www1.artemis.service.connectors.pyris.dto.data;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({ @JsonSubTypes.Type(value = PyrisTextMessageContentDTO.class, name = "text"), @JsonSubTypes.Type(value = PyrisJsonMessageContentDTO.class, name = "json"),
        @JsonSubTypes.Type(value = PyrisImageMessageContentDTO.class, name = "image"), })
public interface PyrisMessageContentDTO {
}
