import React, { useState, useCallback, useMemo } from "react";
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
  MdExpandMore,
  MdPictureAsPdf,
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

  // Generate preview URL for files
  const filePreviews = useMemo(() => {
    const previews = {};
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        previews[file.name] = URL.createObjectURL(file);
      }
    });
    return previews;
  }, [files]);

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-start justify-center pt-6 md:pt-12 pb-4 md:pb-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-0 flex flex-col justify-between mx-2 min-h-[85vh] overflow-hidden">
        <div className="px-4 md:px-6 pt-6 md:pt-8 pb-4 md:pb-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 text-center">
            Print Documents
          </h1>
          <p className="text-gray-600 text-center text-sm md:text-base font-medium">
            Upload your files, choose your options, and get them delivered
          </p>
        </div>

        {/* Two Column Layout */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row flex-1 overflow-hidden"
        >
          {/* Left Column - Upload & Options */}
          <div className="flex-1 flex flex-col gap-5 md:gap-6 px-4 md:px-6 pt-4 md:pt-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* File Uploader */}
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 mb-3 text-gray-900">
                <MdCloudUpload size={20} /> Upload Files
              </h2>
              <div
                {...getRootProps()}
                className={`p-6 md:p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? "bg-green-50 border-green-500 scale-[1.02]"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-green-400 hover:bg-gray-100"
                }`}
              >
                <input {...getInputProps()} />
                <MdCloudUpload
                  className="mx-auto mb-2 text-gray-400"
                  size={28}
                />
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  Drag 'n' drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, WEBP • Max 10MB per file
                </p>
              </div>
              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Uploaded Files ({files.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {files.map((file) => {
                      const isImage = file.type.startsWith("image/");
                      const isPdf = file.type === "application/pdf";
                      const fileSize = (file.size / 1024 / 1024).toFixed(2);

                      return (
                        <div
                          key={file.name}
                          className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                          {/* Preview Container */}
                          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                            {isImage ? (
                              <img
                                src={filePreviews[file.name]}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : isPdf ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <MdPictureAsPdf
                                  className="text-red-500"
                                  size={32}
                                />
                                <span className="text-xs font-bold text-gray-600 px-2 text-center truncate">
                                  {file.name.replace(".pdf", "")}
                                </span>
                              </div>
                            ) : (
                              <MdDescription
                                className="text-blue-500"
                                size={32}
                              />
                            )}

                            {/* Overlay with file info */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end p-2">
                              <div className="w-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <p className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                  {fileSize} MB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeFile(file.name)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Print Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Color Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                  <MdPalette className="inline mr-1.5" size={15} /> Color
                </label>
                <div className="relative">
                  <select
                    value={colorType}
                    onChange={(e) => setColorType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400"
                  >
                    <option value="bw">Black & White</option>
                    <option value="color">Color</option>
                  </select>
                  <MdExpandMore
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
              {/* Print Sides */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                  <MdFileCopy className="inline mr-1.5" size={15} /> Sides
                </label>
                <div className="relative">
                  <select
                    value={printSides}
                    onChange={(e) => setPrintSides(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400"
                  >
                    <option value="single-sided">Single-Sided</option>
                    <option value="double-sided">Double-Sided</option>
                  </select>
                  <MdExpandMore
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
              {/* Binding Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide">
                  <MdBook className="inline mr-1.5" size={15} /> Binding
                </label>
                <div className="relative">
                  <select
                    value={bindingType}
                    onChange={(e) => setBindingType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400"
                  >
                    <option value="none">None</option>
                    <option value="stapled">Stapled</option>
                    <option value="spiral">Spiral</option>
                  </select>
                  <MdExpandMore
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-base font-semibold flex items-center gap-2 mb-3 text-gray-900">
                <MdDescription size={20} /> Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share any special instructions for printing..."
                rows="3"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Right Column - Delivery Address */}
          <div className="w-full lg:w-80 bg-gradient-to-b from-blue-50/50 to-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col p-5 md:p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            <h2 className="text-base font-bold flex items-center gap-2 mb-5 text-gray-900">
              <MdLocalShipping size={20} className="text-green-600" /> Delivery
              Address
            </h2>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                  Full Address
                </label>
                <input
                  name="address"
                  value={address.address}
                  onChange={handleAddressChange}
                  placeholder="Enter street address"
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                  Landmark
                </label>
                <input
                  name="landmark"
                  value={address.landmark}
                  onChange={handleAddressChange}
                  placeholder="e.g., near park, beside mall"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  placeholder="e.g., 560001"
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                  City
                </label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="Optional"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">
                  State
                </label>
                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="Optional"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Button at Bottom */}
        <div className="border-t border-gray-200 bg-white px-4 md:px-6 py-5">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
              text-white py-3 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 text-base"
            style={{ minHeight: "48px" }}
          >
            {isLoading ? <Loading size={24} /> : "Place Print Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintOrderPage;
