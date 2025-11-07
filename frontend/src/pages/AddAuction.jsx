import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function AddAuction() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [image, setImage] = useState(null);
  const [bidType, setBidType] = useState('increment');
  const [minimumIncrement, setMinimumIncrement] = useState('1.00');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'ต้องใส่ชื่อสินค้า';
    } else if (title.length < 3) {
      newErrors.title = 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร';
    }
    
    if (!startPrice || Number(startPrice) <= 0) {
      newErrors.startPrice = 'ราคาเริ่มต้นต้องมากกว่า 0';
    } else if (Number(startPrice) < 1) {
      newErrors.startPrice = 'ราคาเริ่มต้นขั้นต่ำคือ ฿1.00';
    }
    
    if (!endTime) {
      newErrors.endTime = 'ต้องเลือกเวลาจบการประมูล';
    } else {
      const endDate = new Date(endTime);
      const now = new Date();
      if (endDate <= now) {
        newErrors.endTime = 'เวลาจบการประมูลต้องเป็นอนาคต';
      } else if (endDate <= new Date(now.getTime() + 30 * 1000)) {
        newErrors.endTime = 'การประมูลต้องดำเนินอย่างน้อย 1 ชั่วโมง';
      }
    }
    
    if (!image) {
      newErrors.image = 'ต้องอัพโหลดรูปสินค้า';
    }
    
    // Validate buy now price if provided
    if (buyNowPrice && buyNowPrice.trim() !== '') {
      const buyNow = Number(buyNowPrice);
      if (isNaN(buyNow) || buyNow <= 0) {
        newErrors.buyNowPrice = 'ราคาปิดประมูลด่วนต้องมากกว่า 0';
      } else if (buyNow <= Number(startPrice)) {
        newErrors.buyNowPrice = 'ราคาปิดประมูลด่วนต้องมากกว่าราคาเริ่มต้น';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('กรุณาแก้ไขข้อผิดพลาดด้านล่าง');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('start_price', startPrice);
    form.append('end_time', endTime);
    form.append('bid_type', bidType);
    if (bidType === 'increment') {
      form.append('minimum_increment', minimumIncrement);
    }
    if (buyNowPrice && String(buyNowPrice).trim() !== '') {
      form.append('buy_now_price', buyNowPrice);
    }
    if (image) form.append('image', image);
    
    try {
      await api.post('/auctions', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('success');
      // Reset form
      setTitle('');
      setDescription('');
      setStartPrice('');
      setEndTime('');
      setBuyNowPrice('');
      setImage(null);
      setPreview('');
      setErrors({});
      
      // Redirect to home after success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (e) {
      setMessage('error');
      console.error('ไม่สามารถสร้างการประมูลได้:', e);
      console.error('Error details:', e.response?.data);
      // Show specific error message if available
      if (e.response?.data?.message) {
        setErrors({ ...errors, general: e.response.data.message });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors({ ...errors, image: '' });
      }
    } else {
      setPreview('');
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <div className="text-center">
            <h1 className="page-title">🏆 สร้างการประมูลใหม่</h1>
            <p className="page-subtitle">ลงขายสินค้าของคุณและเริ่มรับรายได้จากการเสนอราคา</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <span className="text-yellow-600">💰</span>
              <span className="text-sm text-yellow-800 font-medium">
                ค่าธรรมเนียมเว็บไซต์: 5% ของราคาขายสุดท้าย
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center gap-2">
                    <span>📝</span>
                    <span>ข้อมูลพื้นฐาน</span>
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    <div className="form-group">
                      <label htmlFor="title" className="form-label">
                        ชื่อการประมูล *
                      </label>
                      <input
                        id="title"
                        type="text"
                        className={`form-input ${errors.title ? 'error' : ''}`}
                        placeholder="ใส่ชื่อที่น่าสนใจสำหรับการประมูลของคุณ"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (errors.title) {
                            setErrors({ ...errors, title: '' });
                          }
                        }}
                        maxLength={100}
                        disabled={loading}
                      />
                      {errors.title && <div className="form-error">{errors.title}</div>}
                      <div className="form-help">ให้คำอธิบายที่ชัดเจนและน่าสนใจสำหรับผู้เสนอราคา</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description" className="form-label">
                        คำอธิบาย
                      </label>
                      <textarea
                        id="description"
                        className="form-textarea"
                        placeholder="อธิบายรายละเอียดสินค้าของคุณ รวมถึงสภาพ สมบัติ และข้อมูลสำคัญอื่นๆ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        maxLength={500}
                        disabled={loading}
                      />
                      <div className="form-help">
                        {description.length}/500 ตัวอักษร
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center gap-2">
                    <span>💰</span>
                    <span>ราคาและระยะเวลา</span>
                  </h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="startPrice" className="form-label">
                        ราคาเริ่มต้น *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium"></span>
                        <input
                          id="startPrice"
                          type="number"
                          className={`form-input pl-8 ${errors.startPrice ? 'error' : ''}`}
                          placeholder="0.00฿"
                          value={startPrice}
                          onChange={(e) => {
                            setStartPrice(e.target.value);
                            if (errors.startPrice) {
                              setErrors({ ...errors, startPrice: '' });
                            }
                          }}
                          min="1"
                          step="0.01"
                          disabled={loading}
                        />
                      </div>
                      {errors.startPrice && <div className="form-error">{errors.startPrice}</div>}
                      <div className="form-help">จำนวนเงินเสนอราคาขั้นต่ำสำหรับการประมูลของคุณ</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="endTime" className="form-label">
                        เวลาจบการประมูล *
                      </label>
                      <input
                        id="endTime"
                        type="datetime-local"
                        className={`form-input ${errors.endTime ? 'error' : ''}`}
                        value={endTime}
                        onChange={(e) => {
                          setEndTime(e.target.value);
                          if (errors.endTime) {
                            setErrors({ ...errors, endTime: '' });
                          }
                        }}
                        min={getMinDateTime()}
                        disabled={loading}
                      />
                      {errors.endTime && <div className="form-error">{errors.endTime}</div>}
                      <div className="form-help">การประมูลของคุณควรจบเมื่อไหร่?</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Type */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center gap-2">
                    <span>🎯</span>
                    <span>ประเภทการเสนอราคา</span>
                  </h2>
                </div>
                <div className="card-body">
                  <div className="bid-type-selection">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bid-type-option">
                        <input
                          type="radio"
                          id="increment"
                          name="bidType"
                          value="increment"
                          checked={bidType === 'increment'}
                          onChange={(e) => setBidType(e.target.value)}
                          className="bid-type-radio"
                          disabled={loading}
                        />
                        <label htmlFor="increment" className="bid-type-label">
                          <div className="bid-type-header">
                            <span className="bid-type-icon">📈</span>
                            <span className="bid-type-title">การเสนอราคาแบบเพิ่มขึ้น</span>
                          </div>
                          <div className="bid-type-description">
                            การประมูลแบบดั้งเดิมที่ผู้เสนอราคาสามารถเห็นราคาสูงสุดปัจจุบันและเสนอราคาที่สูงกว่าได้ 
                            การเสนอราคาแต่ละครั้งต้องสูงกว่าราคาสูงสุดปัจจุบันตามจำนวนขั้นต่ำที่กำหนด
                          </div>
                        </label>
                      </div>
                      
                      <div className="bid-type-option">
                        <input
                          type="radio"
                          id="sealed"
                          name="bidType"
                          value="sealed"
                          checked={bidType === 'sealed'}
                          onChange={(e) => setBidType(e.target.value)}
                          className="bid-type-radio"
                          disabled={loading}
                        />
                        <label htmlFor="sealed" className="bid-type-label">
                          <div className="bid-type-header">
                            <span className="bid-type-icon">🔒</span>
                            <span className="bid-type-title">การเสนอราคาแบบปิดผนึก</span>
                          </div>
                          <div className="bid-type-description">
                            การประมูลแบบส่วนตัวที่ผู้เสนอราคาส่งราคาสูงสุดของตนโดยไม่เห็นราคาของผู้อื่น 
                            อนุญาตให้เสนอราคาได้เพียงครั้งเดียวต่อคน ผู้ชนะจะถูกเปิดเผยเมื่อการประมูลจบ
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {bidType === 'increment' && (
                      <div className="form-group">
                        <label htmlFor="minimumIncrement" className="form-label">
                          จำนวนเพิ่มขั้นต่ำ
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary"></span>
                          <input
                            id="minimumIncrement"
                            type="number"
                            className="form-input pl-8"
                            placeholder="1.00฿"
                            value={minimumIncrement}
                            onChange={(e) => setMinimumIncrement(e.target.value)}
                            min="0.01"
                            step="0.01"
                            disabled={loading}
                          />
                        </div>
                        <div className="form-help">จำนวนเงินขั้นต่ำที่การเสนอราคาใหม่ต้องสูงกว่าราคาสูงสุดปัจจุบัน</div>
                      </div>
                    )}

                    {/* Buy Now Price - Available for both bid types */}
                    <div className="form-group">
                      
                      <label htmlFor="buyNowPrice" className="form-label">
                        ราคาปิดประมูลด่วน (ไม่บังคับ)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium"></span>
                        <input
                          id="buyNowPrice"
                          type="number"
                          className={`form-input pl-8 ${errors.buyNowPrice ? 'error' : ''}`}
                          placeholder="0.00"
                          value={buyNowPrice}
                          onChange={(e) => {
                            setBuyNowPrice(e.target.value);
                            if (errors.buyNowPrice) {
                              setErrors({ ...errors, buyNowPrice: '' });
                            }
                          }}
                          min={startPrice ? Number(startPrice) + 0.01 : 0.01}
                          step="0.01"
                          disabled={loading}
                        />
                      </div>
                      {errors.buyNowPrice && <div className="form-error">{errors.buyNowPrice}</div>}
                      <div className="form-help">กำหนดราคาที่ผู้ซื้อสามารถซื้อได้ทันทีโดยไม่ต้องรอการประมูลจบ (ต้องมากกว่าราคาเริ่มต้น)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center gap-2">
                    <span>📸</span>
                    <span>รูปภาพสินค้า</span>
                  </h2>
                </div>
                <div className="card-body">
                  <div className="image-upload-area">
                    <div className="upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                        id="image-upload"
                        disabled={loading}
                      />
                      <label htmlFor="image-upload" className="upload-label">
                        <div className="upload-content">
                          <div className="upload-icon">📷</div>
                          <div className="upload-text">
                            <span className="upload-title">เลือกรูปภาพสินค้า</span>
                            <span className="upload-subtitle">คลิกเพื่อเลือกหรือลากและวาง</span>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {preview && (
                      <div className="image-preview">
                        <img src={preview} alt="Product preview" className="preview-image" />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setPreview('');
                            if (errors.image) {
                              setErrors({ ...errors, image: '' });
                            }
                          }}
                          className="remove-image-btn"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {errors.image && <div className="form-error">{errors.image}</div>}
                  <div className="form-help">อัพโหลดรูปภาพที่ชัดเจนและคุณภาพสูงของสินค้าของคุณ</div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="card">
                <div className="card-body">
                  {message === 'success' && (
                    <div className="alert alert-success mb-4">
                      <span>✅</span>
                      <span>สร้างการประมูลสำเร็จ! กำลังเปลี่ยนไปหน้าแรก...</span>
                    </div>
                  )}
                  
                  {message === 'error' && (
                    <div className="alert alert-error mb-4">
                      <span>❌</span>
                      <div>
                        <div>ไม่สามารถสร้างการประมูลได้ กรุณาลองใหม่อีกครั้ง</div>
                        {errors.general && (
                          <div className="mt-2 text-sm font-medium">{errors.general}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {message && message !== 'success' && message !== 'error' && (
                    <div className="alert alert-warning mb-4">
                      <span>⚠️</span>
                      <span>{message}</span>
                    </div>
                  )}

                  {/* Platform Fee Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <span className="text-blue-600 text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 mb-2">ข้อมูลค่าธรรมเนียม</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                          <p>• <strong>ค่าธรรมเนียมเว็บไซต์:</strong> 5% ของราคาขายสุดท้าย</p>
                          <p>• <strong>การชำระเงิน:</strong> เงินจะถูกเก็บไว้ในระบบ escrow จนกว่าผู้ซื้อจะยืนยันการรับสินค้า</p>
                          <p>• <strong>การปล่อยเงิน:</strong> เงินจะถูกโอนเข้าบัญชีของคุณหลังจากผู้ซื้อยืนยันการรับสินค้าแล้ว</p>
                        </div>
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                          <p className="text-xs text-blue-600">
                            <strong>ตัวอย่าง:</strong> หากสินค้าขายในราคา ฿1,000 คุณจะได้รับ ฿950 (หักค่าธรรมเนียม 5% = ฿50)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="loading">
                          <div className="spinner"></div>
                          <span>กำลังสร้างการประมูล...</span>
                        </div>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>สร้างการประมูล</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="btn btn-secondary btn-lg"
                      disabled={loading}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}