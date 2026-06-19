import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient.js';
import { canAccessPlan, PLAN_TIERS } from '../utils/plans.js';
import { formatContent } from '../utils/serializers.js';
import storage from '../storage/index.js';

const parseOptionalUser = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const getUserAccess = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, planTier: true },
  });

  if (!user) return null;
  return { role: user.role, plan_tier: user.planTier };
};

const resolveContentUrls = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const formatted = { ...item };
      if (formatted.url && !formatted.url.startsWith('http')) {
        const normalized = formatted.url.startsWith('/uploads/')
          ? formatted.url.replace(/^\/uploads\//, '')
          : formatted.url;
        formatted.url = storage.resolveUrl(normalized);
      }
      return formatted;
    })
  );
};

const filterContentForUser = (content, access) => {
  if (!access) {
    return content.filter((item) => (item.plan_tier || 'free') === 'free');
  }
  if (access.role === 'admin') return content;
  return content.filter((item) => canAccessPlan(access.plan_tier, item.plan_tier || 'free'));
};

export const getContent = async (req, res) => {
  try {
    const rows = await prisma.content.findMany({
      include: { uploader: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const allContent = rows.map(formatContent);
    const tokenUser = parseOptionalUser(req);
    const access = tokenUser ? await getUserAccess(tokenUser.id) : null;
    let content = filterContentForUser(allContent, access);
    content = await resolveContentUrls(content);

    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getContentById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.content.findUnique({
      where: { id },
      include: { uploader: { select: { name: true } } },
    });

    if (!row) {
      return res.status(404).json({ error: 'Content not found' });
    }

    let content = formatContent(row);
    const tokenUser = parseOptionalUser(req);
    const access = tokenUser ? await getUserAccess(tokenUser.id) : null;

    if (!filterContentForUser([content], access).length) {
      return res.status(403).json({ error: 'No tienes acceso a este contenido con tu plan actual' });
    }

    [content] = await resolveContentUrls([content]);

    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadContent = async (req, res) => {
  try {
    const { title, description, type, url, is_free, plan_tier } = req.body;

    let finalUrl = url;

    if (!title || !type || (!finalUrl && !req.file)) {
      return res.status(400).json({ error: 'Title, type and url/file are required' });
    }

    let storagePath = null;
    if (req.file) {
      storagePath = await storage.upload(req.file, 'content');
      finalUrl = storagePath;
    }

    const selectedPlan = plan_tier || (is_free === '1' || is_free === 'true' || is_free === 'on' ? 'free' : 'basico');
    if (!PLAN_TIERS.includes(selectedPlan)) {
      return res.status(400).json({ error: 'Plan de contenido no válido' });
    }

    const uploaderId = req.user?.id;

    if (!uploaderId) {
      return res.status(401).json({ error: 'Uploader not identified' });
    }

    const freeFlag = selectedPlan === 'free' ? 1 : 0;

    const created = await prisma.content.create({
      data: {
        title,
        description: description || '',
        type,
        url: finalUrl,
        isFree: freeFlag,
        planTier: selectedPlan,
        uploadedBy: uploaderId,
      },
    });

    const content = formatContent(created);

    if (storagePath) {
      content.url = storage.resolveUrl(storagePath);
    }

    res.json({ message: 'Content uploaded', content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const found = await prisma.content.findUnique({ where: { id } });

    if (!found) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const storagePath = found.url && !found.url.startsWith('http')
      ? (found.url.startsWith('/uploads/') ? found.url.replace(/^\/uploads\//, '') : found.url)
      : null;

    if (storagePath) {
      try {
        await storage.delete(storagePath);
      } catch (_e) {
        // ignore cleanup error
      }
    }

    await prisma.content.delete({ where: { id } });

    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFreeContent = async (_req, res) => {
  try {
    const rows = await prisma.content.findMany({
      where: {
        OR: [{ planTier: 'free' }, { isFree: 1 }],
      },
      include: { uploader: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let content = rows.map(formatContent);
    content = await resolveContentUrls(content);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
