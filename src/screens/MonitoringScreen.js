import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { Pagination } from "../components/Pagination.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext.js";

export function MonitoringScreen({ navigation }) {
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();
  const { isGuest } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchReadings = useCallback(async (page = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getSensorReadings(page, limit);
      // Handle both array response and paginated response
      if (Array.isArray(data)) {
        setReadings(data);
        setTotalPages(1);
      } else {
        setReadings(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        setCurrentPage(data.currentPage ?? page);
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReadings(currentPage);
    }, [fetchReadings, currentPage])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings(currentPage);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings, currentPage]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    fetchReadings(newPage);
  }, [fetchReadings]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isGuest && (
        <View style={styles.guestBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.guestText}>You are browsing as a guest</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Realtime Temperature</Text>
        <View style={styles.valueRow}>
          <Text style={styles.temperatureText}>
            {typeof temperature === "number" ? `${temperature.toFixed(2)}°C` : "--"}
          </Text>
        </View>
        <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
        {timestamp && (
          <Text style={styles.metaText}>
            Last update: {new Date(timestamp).toLocaleString()}
          </Text>
        )}
        {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError}</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Triggered Readings History</Text>
        {loading && <ActivityIndicator />}
      </View>
      {apiError && <Text style={styles.errorText}>Failed to load history: {apiError}</Text>}
      <DataTable
        columns={[
          {
            key: "recorded_at",
            title: "Timestamp",
            render: (value) => (value ? new Date(value).toLocaleString() : "--"),
          },
          {
            key: "temperature",
            title: "Temperature (°C)",
            render: (value) =>
              typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
          },
          {
            key: "threshold_value",
            title: "Threshold (°C)",
            render: (value) =>
              typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
          },
        ]}
        data={readings}
        keyExtractor={(item) => item.id}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  guestText: {
    flex: 1,
    marginLeft: 8,
    color: "#1f2937",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
