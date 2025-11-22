import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Searchbar, Button, TextInput, Chip, MD3Theme, Portal, Modal, List, IconButton, Title } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { User } from '../../services/database';

export interface ProductFilterState {
    searchQuery: string;
    selectedUserId?: number;
    dateFrom?: string;
    dateTo?: string;
}

interface ProductFiltersProps {
    onFilterChange: (filters: ProductFilterState) => void;
    users: User[];
    theme: MD3Theme;
}

export default function ProductFilters({ onFilterChange, users, theme }: ProductFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
    const [dateFrom, setDateFrom] = useState<Date | undefined>();
    const [dateTo, setDateTo] = useState<Date | undefined>();
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDateFromPicker, setShowDateFromPicker] = useState(false);
    const [showDateToPicker, setShowDateToPicker] = useState(false);

    const selectedUser = users.find(u => u.id === selectedUserId);

    const applyFilters = () => {
        onFilterChange({
            searchQuery,
            selectedUserId,
            dateFrom: dateFrom?.toISOString(),
            dateTo: dateTo?.toISOString(),
        });
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onFilterChange({
            searchQuery: query,
            selectedUserId,
            dateFrom: dateFrom?.toISOString(),
            dateTo: dateTo?.toISOString(),
        });
    };

    const handleUserSelect = (userId?: number) => {
        setSelectedUserId(userId);
        setShowUserModal(false);
        onFilterChange({
            searchQuery,
            selectedUserId: userId,
            dateFrom: dateFrom?.toISOString(),
            dateTo: dateTo?.toISOString(),
        });
    };

    const handleDateFromChange = (event: any, selectedDate?: Date) => {
        setShowDateFromPicker(false);
        if (selectedDate) {
            setDateFrom(selectedDate);
            onFilterChange({
                searchQuery,
                selectedUserId,
                dateFrom: selectedDate.toISOString(),
                dateTo: dateTo?.toISOString(),
            });
        }
    };

    const handleDateToChange = (event: any, selectedDate?: Date) => {
        setShowDateToPicker(false);
        if (selectedDate) {
            setDateTo(selectedDate);
            onFilterChange({
                searchQuery,
                selectedUserId,
                dateFrom: dateFrom?.toISOString(),
                dateTo: selectedDate.toISOString(),
            });
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedUserId(undefined);
        setDateFrom(undefined);
        setDateTo(undefined);
        onFilterChange({
            searchQuery: '',
            selectedUserId: undefined,
            dateFrom: undefined,
            dateTo: undefined,
        });
    };

    const hasActiveFilters = searchQuery || selectedUserId || dateFrom || dateTo;

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <Searchbar
                placeholder="Search products..."
                onChangeText={handleSearchChange}
                value={searchQuery}
                style={styles.searchbar}
            />

            {/* Filter Chips */}
            <View style={styles.chipsContainer}>
                {/* User Filter */}
                <Chip
                    icon="account"
                    onPress={() => setShowUserModal(true)}
                    selected={!!selectedUserId}
                    style={styles.chip}
                >
                    {selectedUser ? selectedUser.name : 'All Users'}
                </Chip>

                {/* Date From Filter */}
                <Chip
                    icon="calendar-start"
                    onPress={() => setShowDateFromPicker(true)}
                    selected={!!dateFrom}
                    style={styles.chip}
                    onClose={dateFrom ? () => {
                        setDateFrom(undefined);
                        onFilterChange({
                            searchQuery,
                            selectedUserId,
                            dateFrom: undefined,
                            dateTo: dateTo?.toISOString(),
                        });
                    } : undefined}
                >
                    {dateFrom ? `From: ${dateFrom.toLocaleDateString()}` : 'From Date'}
                </Chip>

                {/* Date To Filter */}
                <Chip
                    icon="calendar-end"
                    onPress={() => setShowDateToPicker(true)}
                    selected={!!dateTo}
                    style={styles.chip}
                    onClose={dateTo ? () => {
                        setDateTo(undefined);
                        onFilterChange({
                            searchQuery,
                            selectedUserId,
                            dateFrom: dateFrom?.toISOString(),
                            dateTo: undefined,
                        });
                    } : undefined}
                >
                    {dateTo ? `To: ${dateTo.toLocaleDateString()}` : 'To Date'}
                </Chip>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Chip
                        icon="close"
                        onPress={clearFilters}
                        style={styles.clearChip}
                    >
                        Clear
                    </Chip>
                )}
            </View>

            {/* User Selection Modal */}
            <Portal>
                <Modal
                    visible={showUserModal}
                    onDismiss={() => setShowUserModal(false)}
                    contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <Title>Filter by User</Title>
                        <IconButton icon="close" size={20} onPress={() => setShowUserModal(false)} />
                    </View>
                    <List.Item
                        title="All Users"
                        left={(props) => <List.Icon {...props} icon="account-multiple" />}
                        right={(props) => !selectedUserId ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                        onPress={() => handleUserSelect(undefined)}
                    />
                    {users.map((user) => (
                        <List.Item
                            key={user.id}
                            title={user.name}
                            left={(props) => <List.Icon {...props} icon="account" />}
                            right={(props) => user.id === selectedUserId ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                            onPress={() => handleUserSelect(user.id)}
                        />
                    ))}
                </Modal>
            </Portal>

            {/* Date Pickers */}
            {showDateFromPicker && (
                <DateTimePicker
                    value={dateFrom || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateFromChange}
                />
            )}
            {showDateToPicker && (
                <DateTimePicker
                    value={dateTo || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateToChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    searchbar: {
        marginBottom: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        marginBottom: 4,
    },
    clearChip: {
        backgroundColor: '#ffebee',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
});
