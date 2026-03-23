import { asyncHandler } from '../../middlewares/error.middleware.js';
import * as adminService from './admin.service.js';

// ── STATS ──────────────────────────────────────────────────────────────────
export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getGlobalStats();
  res.json({ success: true, data: stats });
});

// ── TEACHERS ───────────────────────────────────────────────────────────────
export const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await adminService.getAllTeachers();
  res.json({ success: true, data: teachers });
});

export const getPendingTeachers = asyncHandler(async (req, res) => {
  const teachers = await adminService.getPendingTeachers();
  res.json({ success: true, data: teachers });
});

export const getTeacherDetails = asyncHandler(async (req, res) => {
  const teacher = await adminService.getTeacherDetails(req.params.id);
  res.json({ success: true, data: teacher });
});

export const validateTeacher = asyncHandler(async (req, res) => {
  await adminService.validateTeacher(req.params.id, req.user.id, req.body.comment);
  res.json({ success: true, message: 'Enseignant validé avec succès' });
});

export const rejectTeacher = asyncHandler(async (req, res) => {
  await adminService.rejectTeacher(req.params.id, req.user.id, req.body.comment);
  res.json({ success: true, message: 'Enseignant refusé' });
});

export const certifyTeacher = asyncHandler(async (req, res) => {
  await adminService.certifyTeacher(req.params.id, req.user.id);
  res.json({ success: true, message: 'Enseignant certifié avec succès' });
});

export const decertifyTeacher = asyncHandler(async (req, res) => {
  await adminService.decertifyTeacher(req.params.id, req.user.id);
  res.json({ success: true, message: 'Certification retirée' });
});

// ── PARENTS ────────────────────────────────────────────────────────────────
export const getAllParents = asyncHandler(async (req, res) => {
  const parents = await adminService.getAllParents();
  res.json({ success: true, data: parents });
});

// ── SCHOOLS ────────────────────────────────────────────────────────────────
export const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await adminService.getAllSchools();
  res.json({ success: true, data: schools });
});

// ── ADMINS ─────────────────────────────────────────────────────────────────
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await adminService.getAllAdmins();
  res.json({ success: true, data: admins });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);
  res.status(201).json({ success: true, data: admin, message: 'Administrateur créé avec succès' });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  await adminService.deleteAdmin(req.params.id, req.user.id);
  res.json({ success: true, message: 'Administrateur supprimé' });
});

// ── DOCUMENTS ──────────────────────────────────────────────────────────────
export const verifyDocument = asyncHandler(async (req, res) => {
  const doc = await adminService.verifyDocument(req.params.docId, req.user.id);
  res.json({ success: true, data: doc, message: 'Document vérifié' });
});

export const rejectDocument = asyncHandler(async (req, res) => {
  const doc = await adminService.rejectDocument(req.params.docId, req.user.id);
  res.json({ success: true, data: doc, message: 'Document refusé' });
});

// ── PMF COHORTS ────────────────────────────────────────────────────────────
export const getPMFCohorts = asyncHandler(async (req, res) => {
  const data = await adminService.getPMFCohorts();
  res.json({ success: true, data });
});

