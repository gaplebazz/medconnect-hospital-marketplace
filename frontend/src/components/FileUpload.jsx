import { useRef, useState } from 'react';

export default function FileUpload({ label, name, multiple = false, onChange, hint }) {
  const inputRef = useRef();
  const [fileNames, setFileNames] = useState([]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFileNames(files.map((f) => f.name));
    onChange(multiple ? files : files[0]);
  };

  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="file-drop" onClick={() => inputRef.current?.click()}>
        {fileNames.length > 0 ? (
          <span>{fileNames.join(', ')}</span>
        ) : (
          <span>Click to upload {multiple ? 'images' : 'a photo'} (JPG, PNG, WEBP — max 5MB)</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}
