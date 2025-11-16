import styles from './gallery.module.css';
import { listGalleryImages } from '../actions/listGallery';

export default async function GalleryPage() {
  const images = await listGalleryImages();

  return (
    <div className={styles.gallery}>
      <h1>Gallery</h1>

      <div className={styles.grid}>
        {images.map((img) => (
          <div key={img.url} className={styles.item}>
            <img src={img.url} alt="Drawing" />
          </div>
        ))}
      </div>
    </div>
  );
}
