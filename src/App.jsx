import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [translatedProducts, setTranslatedProducts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('Ürünler alınamadı.');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const translateText = async (text) => {
      const encoded = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|tr`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData.translatedText) {
          return data.responseData.translatedText;
        } else {
          return text;
        }
      } catch (err) {
        console.error('Çeviri hatası:', err);
        return text; 
      }
    };

    const translateProducts = async () => {
      const translated = await Promise.all(
        products.map(async (product) => {
          const translatedTitle = await translateText(product.title);
          const translatedCategory = await translateText(product.category);
          return {
            ...product,
            translatedTitle,
            translatedCategory,
          };
        })
      );
      setTranslatedProducts(translated);
    };

    if (products.length > 0) {
      translateProducts();
    }
  }, [products]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.TRY);
      } catch (err) {
        console.error('Kur alınamadı:', err);
      }
    };

    fetchExchangeRate();
  }, []);

  if (loading) return <p className="loading">Ürünler yükleniyor, lütfen bekleyin...</p>;
  if (error) return <p className="error">Bir hata oluştu: {error}</p>;

  return (
    <div>
      <h1>Ürün Listesi</h1>
      <ul>
        {translatedProducts.map((product) => {
          const priceTL = exchangeRate ? (product.price * exchangeRate).toFixed(2) : 'Hesaplanıyor...';
          return (
            <li key={product.id}>
              <img src={product.image} alt={product.title} className="product-image" />
              <div><strong>{product.translatedTitle}</strong></div>
              <div>Kategori: {product.translatedCategory}</div>
              <div>Fiyat: ₺{priceTL}</div>
            </li>
          );          
        })}
      </ul>
    </div>
  );
}

export default App;
