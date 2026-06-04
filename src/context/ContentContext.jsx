import { createContext, useContext, useEffect, useState } from 'react';
import { contentService } from '../services/api.js';

const ContentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await contentService.getContent();
      setContent(res.data.content || []);
      setError(null);
    } catch (err) {
      setError('Error loading content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFreeContent = async () => {
    try {
      setLoading(true);
      const res = await contentService.getFreeContent();
      setContent(res.data.content || []);
      setError(null);
    } catch (err) {
      setError('Error loading free content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addContent = (newContent) => {
    setContent([newContent, ...content]);
  };

  const removeContent = (id) => {
    setContent(content.filter(item => item.id !== id));
  };

  return (
    <ContentContext.Provider value={{ content, loading, error, loadContent, loadFreeContent, addContent, removeContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
};
