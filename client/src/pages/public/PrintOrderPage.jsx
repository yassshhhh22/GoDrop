import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import {
  MdCloudUpload,
  MdDescription,
  MdPalette,
  MdFileCopy,
  MdBook,
  MdLocalShipping,
  MdDelete,
} from "react-icons/md";
import usePrintOrderStore from "../../stores/printOrderStore";
import Loading from "../../components/layout/Loading";

const PrintOrderPage = () => {
  const navigate = useNavigate();
  const { createPrintOrder, isLoading } = usePrintOrderStore();
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [colorType, setColorType] = useState("bw");
  const [printSides, setPrintSides] = useState("single-sided");
  const [bindingType, setBindingType] = useState("none");
  const [address, setAddress] = useState({
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please upload at least one file.");
      return;
    }
    if (!address.address || !address.pincode) {
      alert("Please provide a complete delivery address and pincode.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("description", description);
    formData.append("colorType", colorType);
    formData.append("printSides", printSides);
    formData.append("bindingType", bindingType);
    formData.append("deliveryAddress[address]", address.address);
    formData.append("deliveryAddress[landmark]", address.landmark);
    formData.append("deliveryAddress[city]", address.city);
    formData.append("deliveryAddress[state]", address.state);
    formData.append("deliveryAddress[pincode]", address.pincode);

    const result = await createPrintOrder(formData);
    if (result) {
      navigate(`/order/${result.orderId}`);
    }
  };

  return (
    <div className="bg-grey-50 min-h-screen flex items-start justify-center pt-6 md:pt-12 pb-4 md:pb-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-0 flex flex-col justify-center mx-2">
        <div className="px-4 md:px-6 pt-2 md:pt-4 pb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-grey-900 mb-2 text-center">
            Print Documents
          </h1>
          <p className="text-secondary-500 mb-6 md:mb-8 text-center text-base md:text-lg">
            Upload your files, choose your options, and get them delivered.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8 px-4 md:px-6 pb-6 md:pb-8">
          {/* File Uploader */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MdCloudUpload /> Upload Files
            </h2>
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors bg-secondary-50 border-grey-200 focus-within:border-primary-600`}
            >
              <input {...getInputProps()} />
              <p>Drag 'n' drop files here, or click to select files</p>
              <em className="text-sm text-secondary-500">
                (PDF, JPG, PNG, WEBP accepted, max 10MB per file)
              </em>
            </div>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((file) => (
                  <li
                    key={file.name}
                    className="flex justify-between items-center p-2 bg-secondary-50 rounded-lg"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="text-error hover:text-error/80"
                    >
                      <MdDelete size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Print Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Color Type */}
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <MdPalette /> Color
              </h3>
              <select
                value={colorType}
                onChange={(e) => setColorType(e.target.value)}
                className="w-full bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm appearance-none"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                  textAlignLast: "center",
                }}
              >
                <option value="bw">Black & White</option>
                <option value="color">Color</option>
              </select>
            </div>
            {/* Print Sides */}
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <MdFileCopy /> Sides
              </h3>
              <select
                value={printSides}
                onChange={(e) => setPrintSides(e.target.value)}
                className="w-full bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm appearance-none"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                  textAlignLast: "center",
                }}
              >
                <option value="single-sided">Single-Sided</option>
                <option value="double-sided">Double-Sided</option>
              </select>
            </div>
            {/* Binding Type */}
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <MdBook /> Binding
              </h3>
              <select
                value={bindingType}
                onChange={(e) => setBindingType(e.target.value)}
                className="w-full bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm appearance-none"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                  textAlignLast: "center",
                }}
              >
                <option value="none">None</option>
                <option value="stapled">Stapled</option>
                <option value="spiral">Spiral</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MdDescription /> Description (Optional)
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any special instructions for printing..."
              rows="3"
              className="w-full bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
              style={{
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                minHeight: 44,
              }}
            ></textarea>
          </div>

          {/* Delivery Address */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MdLocalShipping /> Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="address"
                value={address.address}
                onChange={handleAddressChange}
                placeholder="Full Address"
                required
                className="md:col-span-2 bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
              <input
                name="landmark"
                value={address.landmark}
                onChange={handleAddressChange}
                placeholder="Landmark (Optional)"
                className="bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="Pincode"
                required
                className="bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="City (Optional)"
                className="bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
              <input
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="State (Optional)"
                className="bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-grey-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 disabled:cursor-not-allowed
              text-grey-50 py-3 rounded-xl font-semibold transition-all duration-200
              focus:outline-none text-base"
            style={{ minHeight: "48px" }}
          >
            {isLoading ? <Loading size={24} /> : "Place Print Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrintOrderPage;
