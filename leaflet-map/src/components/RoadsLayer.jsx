import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { getColor } from "../helpers/utils";

const RoadsLayer = ({ data, selectedEvaluation, selectedSubEvaluation, setSelectedRoad, setIsModalOpen }) => {
    const map = useMap();

    useEffect(() => {
        if (!data || !map) return;

        // Remove previous layers before adding new ones
        map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        const roadsLayer = new L.GeoJSON(data, {
            style: (feature) => {
                const grades = feature.properties.eemi_grade;
                const color = selectedEvaluation === "sub_type_grades"
                    ? getColor(grades?.sub_type_grades?.[selectedSubEvaluation])
                    : getColor(grades?.[selectedEvaluation]);

                return { color, weight: 5 };
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => {
                        e.target.setStyle({ weight: 8 });

                        const props = feature.properties;
                        const roadID = props.fid || "N/A";
                        const evaluationValue =
                            selectedEvaluation === "sub_type_grades"
                                ? props.eemi_grade?.sub_type_grades?.[selectedSubEvaluation] ?? "N/A"
                                : props.eemi_grade?.[selectedEvaluation] ?? "N/A";

                        const evaluationTitle =
                            selectedEvaluation === "sub_type_grades"
                                ? `Sub-Type: ${selectedSubEvaluation.toUpperCase()}`
                                : selectedEvaluation.toUpperCase();

                        const popupContent = `
                            <div>
                                <strong>Road ID:</strong> ${roadID}<br/>
                                <strong>${evaluationTitle}:</strong> ${evaluationValue}<br/>
                                <strong>EVNK:</strong> ${props.evnk}<br/>
                                <strong>ENNK:</strong> ${props.ennk}<br/>
                                <strong>Length:</strong> ${props.len}m<br/>
                            </div>`;

                        layer.bindPopup(popupContent).openPopup();
                    },
                    mouseout: (e) => {
                        e.target.setStyle({ weight: 5 });
                        layer.closePopup();
                    },
                    click: () => {
                        setSelectedRoad(feature.properties.fid);
                        setIsModalOpen(true);
                    }
                });
            }
        });

        roadsLayer.addTo(map);
    }, [data, selectedEvaluation, selectedSubEvaluation, map, setSelectedRoad, setIsModalOpen]);

    return null;
};

export default RoadsLayer;
