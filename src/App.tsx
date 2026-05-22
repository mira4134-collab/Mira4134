/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardView from "./components/DashboardView";
import PublicCardView from "./components/PublicCardView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/card/:id" element={<PublicCardView />} />
        <Route path="*" element={<DashboardView />} />
      </Routes>
    </BrowserRouter>
  );
}
