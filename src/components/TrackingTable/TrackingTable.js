import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Searchbar, IconButton, Button, Menu, Divider } from 'react-native-paper';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ITEMS_PER_PAGE = 10;

const TrackingTable = ({ collectionName, columns, filterOptions = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastVisible, setLastVisible] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, [selectedFilter]);

    const loadData = async (isRefresh = false) => {
        try {
            setRefreshing(isRefresh);

            // Si es refresh, resetear lastVisible
            if (isRefresh) {
                setLastVisible(null);
            }

            let trackingRef = collection(db, collectionName);
            let trackingQuery;

            // Aplicar filtros si se seleccionó alguno
            if (selectedFilter && selectedFilter.field && selectedFilter.value !== undefined) {
                trackingQuery = query(
                    trackingRef,
                    where(selectedFilter.field, selectedFilter.operator || '==', selectedFilter.value),
                    orderBy(sortConfig.key, sortConfig.direction),
                    limit(ITEMS_PER_PAGE)
                );
            } else {
                trackingQuery = query(
                    trackingRef,
                    orderBy(sortConfig.key, sortConfig.direction),
                    limit(ITEMS_PER_PAGE)
                );
            }

            // Si no es refresh y tenemos lastVisible, hacer paginación
            if (!isRefresh && lastVisible) {
                trackingQuery = query(
                    trackingRef,
                    where(selectedFilter?.field || 'createdAt', selectedFilter?.operator || '>=', selectedFilter?.value || lastVisible),
                    orderBy(sortConfig.key, sortConfig.direction),
                    limit(ITEMS_PER_PAGE),
                    startAfter(lastVisible)
                );
            }

            const snapshot = await getDocs(trackingQuery);

            if (!snapshot.empty) {
                const newData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Actualizar lastVisible para paginación
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

                // Si es refresh, reemplazar datos, si no, agregar a los existentes
                if (isRefresh) {
                    setData(newData);
                } else {
                    setData(prev => [...prev, ...newData]);
                }
            }
        } catch (error) {
            console.error('Error loading tracking data:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos de seguimiento');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLoadMore = () => {
        if (lastVisible) {
            loadData();
        }
    };

    const handleRefresh = () => {
        loadData(true);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implementar lógica de búsqueda local
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));

        // Reset y volver a cargar datos
        setLastVisible(null);
        loadData(true);
    };

    const handleFilter = (filter) => {
        setSelectedFilter(filter);
        setMenuVisible(false);
    };

    const handleExport = async () => {
        try {
            setLoading(true);

            // Obtenemos todos los datos (sin paginación) para exportar
            let trackingRef = collection(db, collectionName);
            let exportQuery;

            if (selectedFilter && selectedFilter.field && selectedFilter.value !== undefined) {
                exportQuery = query(
                    trackingRef,
                    where(selectedFilter.field, selectedFilter.operator || '==', selectedFilter.value),
                    orderBy(sortConfig.key, sortConfig.direction)
                );
            } else {
                exportQuery = query(
                    trackingRef,
                    orderBy(sortConfig.key, sortConfig.direction)
                );
            }

            const snapshot = await getDocs(exportQuery);
            const exportData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Convertir a CSV
            const header = columns.map(col => col.label).join(',');
            const rows = exportData.map(item => {
                return columns
                    .map(col => {
                        const value = item[col.field];
                        // Manejar valores que podrían contener comas
                        if (typeof value === 'string' && value.includes(',')) {
                            return `"${value}"`;
                        }
                        return value !== undefined ? value : '';
                    })
                    .join(',');
            });

            const csvContent = [header, ...rows].join('\n');

            // Crear archivo temporal
            const fileDate = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${collectionName}-export-${fileDate}.csv`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(filePath, csvContent);

            // Compartir archivo
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
            } else {
                Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            Alert.alert('Error', 'No se pudieron exportar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar datos localmente basado en searchQuery
    const filteredData = data.filter(item => {
        if (!searchQuery) return true;

        // Buscar en todas las columnas
        return columns.some(col => {
            const value = item[col.field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        });
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('Detalle', `ID: ${item.id}`)}
        >
            {columns.map((col) => (
                <View key={col.field} style={[styles.cell, { flex: col.flex || 1 }]}>
                    <Text numberOfLines={1} style={styles.cellText}>
                        {col.render ? col.render(item) : item[col.field] || '-'}
                    </Text>
                </View>
            ))}
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.headerRow}>
            {columns.map((col) => (
                <TouchableOpacity
                    key={col.field}
                    style={[styles.headerCell, { flex: col.flex || 1 }]}
                    onPress={() => handleSort(col.field)}
                >
                    <Text style={styles.headerText}>{col.label}</Text>
                    {sortConfig.key === col.field && (
                        <Text style={styles.sortIndicator}>
                            {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <Searchbar
                    placeholder="Buscar"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                <View style={styles.actions}>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <Button
                                mode="outlined"
                                onPress={() => setMenuVisible(true)}
                                icon="filter-variant"
                            >
                                {selectedFilter ? 'Filtrado' : 'Filtrar'}
                            </Button>
                        }
                    >
                        {filterOptions.map((filter, index) => (
                            <React.Fragment key={index}>
                                <Menu.Item
                                    onPress={() => handleFilter(filter)}
                                    title={filter.label}
                                />
                                {index < filterOptions.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                        {selectedFilter && (
                            <>
                                <Divider />
                                <Menu.Item
                                    onPress={() => handleFilter(null)}
                                    title="Borrar filtro"
                                />
                            </>
                        )}
                    </Menu>

                    <Button
                        mode="contained"
                        onPress={handleExport}
                        icon="export"
                        style={styles.exportButton}
                    >
                        Exportar
                    </Button>
                </View>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={renderHeader}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        lastVisible && (
                            <ActivityIndicator size="small" style={styles.footerLoader} />
                        )
                    }
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No hay datos disponibles
                            </Text>
                        </View>
                    }
                    stickyHeaderIndices={[0]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    toolbar: {
        flexDirection: 'column',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        elevation: 2,
    },
    searchBar: {
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exportButton: {
        marginLeft: 8,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#e1e1e1',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    headerText: {
        fontWeight: 'bold',
    },
    sortIndicator: {
        marginLeft: 5,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    cell: {
        paddingHorizontal: 5,
    },
    cellText: {
        fontSize: 14,
    },
    loader: {
        marginVertical: 20,
    },
    footerLoader: {
        marginVertical: 10,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default TrackingTable;