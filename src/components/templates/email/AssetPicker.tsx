import React, { useState, useCallback, useEffect } from 'react';
import { UploadFileInS3, getPublicUrl } from '@/services/upload_file';
import { getUserId } from '@/utils/userDetails';
import { getInstituteId } from '@/constants/helper';
import { toast } from 'sonner';

export interface AssetImage {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    category: string;
}

interface AssetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

const AssetPicker: React.FC<AssetPickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [assets, setAssets] = useState<AssetImage[]>([]);
    const [uploadedAssets, setUploadedAssets] = useState<AssetImage[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Load uploaded assets from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('uploadedAssets');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUploadedAssets(parsed);
            } catch (e) {
                console.error('Failed to parse stored assets:', e);
            }
        }
    }, []);

    // Get all categories
    const allAssets = [...assets, ...uploadedAssets];
    const categories = ['All', ...new Set(allAssets.map((a) => a.category))];

    // Filter assets based on category and search
    const filteredAssets = allAssets.filter((asset) => {
        const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Helper to convert base64 to File
    const base64ToFile = (base64Data: string, mimeType: string, filename: string): File | null => {
        try {
            const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
            if (!base64String) throw new Error('Invalid base64 data');

            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType });
            return new File([blob], filename, { type: mimeType });
        } catch (error) {
            console.error('Error converting base64 to File:', error);
            return null;
        }
    };

    // Handle file upload
    const handleUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            setIsUploading(true);

            const userId = getUserId();
            const instituteId = getInstituteId();

            if (!userId || !instituteId) {
                toast.error('Missing user credentials. Please refresh and try again.');
                setIsUploading(false);
                return;
            }

            const newAssets: AssetImage[] = [];

            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (!file || !file.type.startsWith('image/')) continue;

                    // Upload to S3
                    const fileId = await UploadFileInS3(
                        file,
                        () => {},
                        userId,
                        'EMAIL_TEMPLATES',
                        instituteId,
                        true // Get public URL
                    );

                    if (!fileId) {
                        console.error('Failed to upload file:', file.name);
                        continue;
                    }

                    const publicUrl = await getPublicUrl(fileId);
                    if (!publicUrl) {
                        console.error('Failed to get public URL for file:', file.name);
                        continue;
                    }

                    const newAsset: AssetImage = {
                        id: `uploaded-${Date.now()}-${i}`,
                        name: file.name.replace(/\.[^/.]+$/, ''),
                        url: publicUrl,
                        thumbnail: publicUrl,
                        category: 'Uploaded',
                    };

                    newAssets.push(newAsset);
                }

                const updatedUploaded = [...uploadedAssets, ...newAssets];
                setUploadedAssets(updatedUploaded);
                localStorage.setItem('uploadedAssets', JSON.stringify(updatedUploaded));

                if (newAssets.length > 0) {
                    toast.success(`${newAssets.length} image${newAssets.length > 1 ? 's' : ''} uploaded successfully!`);
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                toast.error('Failed to upload some images. Please try again.');
            } finally {
                setIsUploading(false);
                event.target.value = '';
            }
        },
        [uploadedAssets]
    );

    // Handle image selection
    const handleSelect = useCallback(
        (imageUrl: string) => {
            onSelect(imageUrl);
            onClose();
        },
        [onSelect, onClose]
    );

    // Handle delete uploaded asset
    const handleDelete = useCallback(
        (assetId: string, event: React.MouseEvent) => {
            event.stopPropagation();
            const updated = uploadedAssets.filter((a) => a.id !== assetId);
            setUploadedAssets(updated);
            localStorage.setItem('uploadedAssets', JSON.stringify(updated));
            toast.success('Asset deleted');
        },
        [uploadedAssets]
    );

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>📁 Select Image from Assets</h2>
                    <button style={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Toolbar */}
                <div style={styles.toolbar}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={styles.searchInput}
                    />

                    {/* Category filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={styles.categorySelect}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Upload button */}
                    <label style={styles.uploadButton}>
                        {isUploading ? 'Uploading...' : '📤 Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                        />
                    </label>
                </div>

                {/* Image grid */}
                <div style={styles.imageGrid}>
                    {filteredAssets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No images found. Upload some images to get started!</p>
                        </div>
                    ) : (
                        filteredAssets.map((asset) => (
                            <div
                                key={asset.id}
                                style={styles.imageCard}
                                onClick={() => handleSelect(asset.url)}
                            >
                                <div style={styles.imageWrapper}>
                                    <img src={asset.thumbnail} alt={asset.name} style={styles.image} />
                                    {asset.id.startsWith('uploaded-') && (
                                        <button
                                            style={styles.deleteButton}
                                            onClick={(e) => handleDelete(asset.id, e)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                <div style={styles.imageName}>{asset.name}</div>
                                <div style={styles.imageCategory}>{asset.category}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #eee',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
        color: '#333',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#666',
        padding: '4px 8px',
        borderRadius: '4px',
    },
    toolbar: {
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
    },
    searchInput: {
        flex: 1,
        minWidth: '200px',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
    },
    categorySelect: {
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        outline: 'none',
    },
    uploadButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 18px',
        backgroundColor: '#667eea',
        color: '#fff',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    imageGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '16px',
        padding: '24px',
        overflowY: 'auto',
        flex: 1,
    },
    imageCard: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        border: '2px solid transparent',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: '#f8f9fa',
    },
    imageWrapper: {
        position: 'relative',
        paddingTop: '75%',
        overflow: 'hidden',
        borderRadius: '6px',
        backgroundColor: '#eee',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    deleteButton: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: 'rgba(255,255,255,0.9)',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 6px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    imageName: {
        marginTop: '8px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#333',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    imageCategory: {
        fontSize: '11px',
        color: '#888',
        marginTop: '2px',
    },
    emptyState: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '60px 20px',
        color: '#888',
    },
};

export default AssetPicker;

