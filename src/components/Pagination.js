import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isFirstPage && styles.buttonDisabled]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={isFirstPage ? "#ccc" : "#2563eb"}
        />
        <Text style={[styles.buttonText, isFirstPage && styles.buttonTextDisabled]}>
          Sebelumnya
        </Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageText}>
          Halaman {currentPage} dari {totalPages || 1}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLastPage && styles.buttonDisabled]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
      >
        <Text style={[styles.buttonText, isLastPage && styles.buttonTextDisabled]}>
          Berikutnya
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isLastPage ? "#ccc" : "#2563eb"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#fff",
    minWidth: 120,
    justifyContent: "center",
  },
  buttonDisabled: {
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  buttonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
    marginHorizontal: 4,
  },
  buttonTextDisabled: {
    color: "#ccc",
  },
  pageInfo: {
    paddingHorizontal: 16,
  },
  pageText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
