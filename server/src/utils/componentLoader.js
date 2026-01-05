import { ComponentLoader } from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Components = {
  ImageUpload: componentLoader.add(
    'ImageUpload',
    path.join(__dirname, '../components/ImageUpload.jsx')
  ),
  ImageThumbnail: componentLoader.add(
    'ImageThumbnail',
    path.join(__dirname, '../components/ImageThumbnail.jsx')
  ),
  ImageGallery: componentLoader.add(
    'ImageGallery',
    path.join(__dirname, '../components/ImageGallery.jsx')
  ),
  AssignPartner: componentLoader.add(
    'AssignPartner',
    path.join(__dirname, '../components/AssignPartner.jsx')
  ),
  NotificationBell: componentLoader.add('NotificationBell', path.join(__dirname,'../components/NotificationBell.jsx')),

  CustomTopBar: componentLoader.add('CustomTopBar', path.join(__dirname,'../components/CustomTopBar.jsx')),
   Dashboard: componentLoader.add(
    'Dashboard',
    path.join(__dirname, '../components/Dashboard.jsx')
  ),
};

export { componentLoader, Components };
