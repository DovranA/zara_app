import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import {
  FAB,
  Card,
  Title,
  Text,
  IconButton,
  useTheme,
  Checkbox,
  Button,
  Portal,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import { useRouter } from "expo-router";
import {
  useProducts,
  useDeleteProduct,
  useUsers,
} from "../../../services/queries";
import ProductFilters, {
  ProductFilterState,
} from "../../../components/product/ProductFilters";
import { generateProductsPDF, PDFProduct } from "../../../services/pdfService";

export default function ProductListScreen() {
  const [filters, setFilters] = useState<ProductFilterState>({
    searchQuery: "",
    selectedUserId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set()
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const theme = useTheme();
  const router = useRouter();

  const { data: products = [], isLoading } = useProducts();
  const { data: users = [] } = useUsers();

  const userMap = users.reduce((acc, user) => {
    if (user.id) acc[user.id] = user;
    return acc;
  }, {} as Record<number, (typeof users)[0]>);

  const deleteProductMutation = useDeleteProduct();
  const handleDelete = (id: number | undefined) => {
    if (!id) return;
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProductMutation.mutate(id),
        },
      ]
    );
  };

  // Combined filtering logic
  const filteredProducts = products.filter((product) => {
    // Filter by product name
    if (
      filters.searchQuery &&
      !product.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by user
    if (filters.selectedUserId && product.user_id !== filters.selectedUserId) {
      return false;
    }

    // Filter by date range
    if (product.delivery_date) {
      const deliveryDate = new Date(product.delivery_date);

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (deliveryDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (deliveryDate > toDate) {
          return false;
        }
      }
    } else if (filters.dateFrom || filters.dateTo) {
      // If product has no delivery date but date filter is active, exclude it
      return false;
    }

    return true;
  });

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedProductIds(new Set());
  };

  const toggleProductSelection = (productId: number | undefined) => {
    if (!productId) return;

    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(
      filteredProducts
        .map((p) => p.id)
        .filter((id): id is number => id !== undefined)
    );
    setSelectedProductIds(allIds);
  };

  const deselectAll = () => {
    setSelectedProductIds(new Set());
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      const selectedProducts: PDFProduct[] = filteredProducts
        .filter((p) => p.id && selectedProductIds.has(p.id))
        .map((p) => ({
          ...p,
          userName:
            p.user_id && userMap[p.user_id]
              ? userMap[p.user_id].name
              : undefined,
        }));

      if (selectedProducts.length === 0) {
        Alert.alert(
          "No Products Selected",
          "Please select at least one product to generate PDF."
        );
        return;
      }

      await generateProductsPDF(selectedProducts);

      // Exit selection mode after successful PDF generation
      setSelectionMode(false);
      setSelectedProductIds(new Set());
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderImageCarousel = (images: string[]) => {
    if (!images || images.length === 0) return null;

    return (
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.carouselImage} />
        )}
        style={styles.carousel}
      />
    );
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ProductFilters onFilterChange={setFilters} users={users} theme={theme} />

      {/* Selection Mode Header */}
      {selectionMode && (
        <View
          style={[
            styles.selectionHeader,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Text style={styles.selectionCount}>
            {selectedProductIds.size} selected
          </Text>
          <View style={styles.selectionActions}>
            <Button mode="text" onPress={selectAll} compact>
              Select All
            </Button>
            <Button mode="text" onPress={deselectAll} compact>
              Deselect All
            </Button>
          </View>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              selectionMode && item.id && selectedProductIds.has(item.id)
                ? styles.selectedCard
                : undefined,
            ]}
            mode="elevated"
            onPress={
              selectionMode ? () => toggleProductSelection(item.id) : undefined
            }
          >
            {selectionMode && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={
                    item.id && selectedProductIds.has(item.id)
                      ? "checked"
                      : "unchecked"
                  }
                  onPress={() => toggleProductSelection(item.id)}
                />
              </View>
            )}
            {item.images && item.images.length > 0
              ? renderImageCarousel(item.images)
              : null}
            <Card.Content>
              <Title>{item.name}</Title>
              <Text>Price: ${item.price.toFixed(2)}</Text>
              {item.note ? <Text>Note: {item.note}</Text> : null}
              {item.delivery_date ? (
                <Text>
                  Delivery Date:{" "}
                  {new Date(item.delivery_date).toLocaleDateString()}
                </Text>
              ) : null}
              {item.user_id && userMap[item.user_id] ? (
                <Text>User: {userMap[item.user_id].name}</Text>
              ) : null}
            </Card.Content>
            {!selectionMode && (
              <Card.Actions>
                {item.user_id && userMap[item.user_id]?.phone ? (
                  <IconButton
                    icon="phone"
                    onPress={() => handleCall(userMap[item.user_id!].phone)}
                  />
                ) : null}
                <IconButton
                  icon="pencil"
                  onPress={() =>
                    router.push(`/products/form?productId=${item.id}`)
                  }
                />
                <IconButton
                  icon="delete"
                  onPress={() => handleDelete(item.id)}
                />
              </Card.Actions>
            )}
          </Card>
        )}
        contentContainerStyle={styles.list}
      />

      {/* FABs */}
      {!selectionMode ? (
        <>
          <FAB
            icon="checkbox-multiple-marked"
            style={[styles.fab, styles.fabSecondary]}
            onPress={toggleSelectionMode}
            label="Select"
            variant="secondary"
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => router.push("/products/form")}
          />
        </>
      ) : (
        <>
          <FAB
            icon="close"
            style={[styles.fab, styles.fabSecondary]}
            onPress={toggleSelectionMode}
            label="Cancel"
            variant="secondary"
          />
          <FAB
            icon="file-pdf-box"
            style={styles.fab}
            onPress={handleGeneratePDF}
            label="Generate PDF"
            disabled={selectedProductIds.size === 0 || isGeneratingPDF}
          />
        </>
      )}

      {/* Loading Dialog */}
      <Portal>
        <Dialog visible={isGeneratingPDF} dismissable={false}>
          <Dialog.Content style={styles.dialogContent}>
            <ActivityIndicator size="large" />
            <Text style={styles.dialogText}>Generating PDF...</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 130,
  },
  card: {
    marginBottom: 16,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#667eea",
  },
  checkboxContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  carousel: {
    height: 200,
    marginBottom: 8,
  },
  carouselImage: {
    width: Dimensions.get("window").width - 32,
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabSecondary: {
    bottom: 80,
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectionCount: {
    fontWeight: "bold",
  },
  selectionActions: {
    flexDirection: "row",
    gap: 8,
  },
  dialogContent: {
    alignItems: "center",
    padding: 24,
  },
  dialogText: {
    marginTop: 16,
  },
});
