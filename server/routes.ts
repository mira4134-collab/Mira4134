import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { dbMode, dbError, getDb, getMemoryStore, Contact } from "./db.js";

const router = Router();

// Match ObjectId format: 24 hex characters
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function generateMemoryId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// Prepopulate Memory Store with polished initial cards for dynamic showcase
const memoryStore = getMemoryStore();
if (memoryStore.length === 0) {
  memoryStore.push({
    _id: "507f1f77bcf86cd799439011",
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.jenkins@techvanguard.dev",
    phone: "+1 (555) 019-2834",
    title: "VP of Engineering",
    organization: "TechVanguard Solutions",
    website: "https://techvanguard.dev",
    address: "100 Innovation Way, Suite 400, San Francisco, CA 94107",
    linkedin: "https://linkedin.com/in/sarah-jenkins-techvanguard",
    twitter: "https://twitter.com/sarahcodes",
    github: "https://github.com/sarah-jenkins",
    avatar: "", // Will use beautiful standard UI placeholder avatar
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  });

  memoryStore.push({
    _id: "507f1f77bcf86cd799439022",
    firstName: "Alex",
    lastName: "Rivera",
    email: "rivera.design@aestheticlabs.io",
    phone: "+1 (555) 014-9981",
    title: "Chief Product Designer",
    organization: "Aesthetic Labs",
    website: "https://aestheticlabs.io",
    address: "50 Art District Boulevard, New York, NY 10011",
    linkedin: "https://linkedin.com/in/alex-rivera-designer",
    twitter: "https://twitter.com/alexr_design",
    github: "https://github.com/alexriveradesign",
    avatar: "", 
    createdAt: new Date().toISOString()
  });
}

// GET /api/config
router.get("/config", async (req: Request, res: Response) => {
  const configured = !!process.env.MONGODB_URI;
  let error = dbError;
  let connected = false;
  let dbName = "N/A";

  if (configured) {
    try {
      const db = await getDb();
      connected = true;
      dbName = db.databaseName;
      error = null;
    } catch (err: any) {
      connected = false;
      error = err.message || "Failed to establish database connection";
    }
  }

  res.json({
    configured,
    mode: connected ? "database" : "memory",
    connected,
    dbName,
    error
  });
});

// GET /api/contacts - Find all contacts
router.get("/contacts", async (req: Request, res: Response) => {
  try {
    const configured = !!process.env.MONGODB_URI;
    if (configured) {
      try {
        const db = await getDb();
        const contacts = await db.collection("contacts").find().sort({ createdAt: -1 }).toArray();
        // Convert ObjectID to string for standard API mapping
        const mapped = contacts.map(c => ({
          ...c,
          _id: c._id.toString()
        }));
        return res.json(mapped);
      } catch (err) {
        // Fallback to memory on live connection failure
        console.warn("DB query failed, fallback to memory contacts", err);
      }
    }
    
    // Memory Mode fallback
    const sortedMemoryStore = [...getMemoryStore()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sortedMemoryStore);
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// POST /api/contacts - Create contact
router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      linkedin,
      twitter,
      github,
      avatar
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    const docData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      title: (title || "").trim(),
      organization: (organization || "").trim(),
      website: (website || "").trim(),
      address: (address || "").trim(),
      linkedin: (linkedin || "").trim(),
      twitter: (twitter || "").trim(),
      github: (github || "").trim(),
      avatar: avatar || "",
      createdAt: new Date().toISOString()
    };

    const configured = !!process.env.MONGODB_URI;
    if (configured) {
      try {
        const db = await getDb();
        const result = await db.collection("contacts").insertOne(docData);
        return res.status(201).json({
          ...docData,
          _id: result.insertedId.toString()
        });
      } catch (err) {
        console.warn("DB insert failed, routing creation to Memory Mode", err);
      }
    }

    // Memory Mode insert
    const memoryDoc: Contact = {
      ...docData,
      _id: generateMemoryId()
    };
    getMemoryStore().push(memoryDoc);
    res.status(201).json(memoryDoc);
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// GET /api/contacts/:id - Read single
router.get("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const configured = !!process.env.MONGODB_URI;
    if (configured) {
      try {
        const db = await getDb();
        const contact = await db.collection("contacts").findOne({ _id: new ObjectId(id) });
        if (contact) {
          return res.json({
            ...contact,
            _id: contact._id.toString()
          });
        }
      } catch (err) {
        console.warn("DB single query failed, falling back to Memory Store search", err);
      }
    }

    // Memory Mode search
    const contact = getMemoryStore().find(c => c._id === id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// PUT /api/contacts/:id - Update contact
router.put("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      title,
      organization,
      website,
      address,
      linkedin,
      twitter,
      github,
      avatar
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    if (firstName !== undefined && !firstName.trim()) {
      return res.status(400).json({ error: "First name cannot be empty" });
    }
    if (lastName !== undefined && !lastName.trim()) {
      return res.status(400).json({ error: "Last name cannot be empty" });
    }

    const updateFields: Partial<Contact> = {};
    if (firstName !== undefined) updateFields.firstName = firstName.trim();
    if (lastName !== undefined) updateFields.lastName = lastName.trim();
    if (email !== undefined) updateFields.email = email.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (title !== undefined) updateFields.title = title.trim();
    if (organization !== undefined) updateFields.organization = organization.trim();
    if (website !== undefined) updateFields.website = website.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (linkedin !== undefined) updateFields.linkedin = linkedin.trim();
    if (twitter !== undefined) updateFields.twitter = twitter.trim();
    if (github !== undefined) updateFields.github = github.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;

    const configured = !!process.env.MONGODB_URI;
    if (configured) {
      try {
        const db = await getDb();
        const result = await db.collection("contacts").findOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).json({ error: "Contact not found" });
        }
        await db.collection("contacts").updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );
        const updated = await db.collection("contacts").findOne({ _id: new ObjectId(id) });
        return res.json({
          ...updated,
          _id: updated!._id.toString()
        });
      } catch (err) {
        console.warn("DB update failed, routing update to Memory Store", err);
      }
    }

    // Memory Mode update
    const store = getMemoryStore();
    const idx = store.findIndex(c => c._id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const updatedMemoryContact: Contact = {
      ...store[idx],
      ...updateFields
    };
    store[idx] = updatedMemoryContact;
    res.json(updatedMemoryContact);
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// DELETE /api/contacts/:id - Delete contact
router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const configured = !!process.env.MONGODB_URI;
    if (configured) {
      try {
        const db = await getDb();
        const result = await db.collection("contacts").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          return res.json({ success: true, message: "Contact deleted successfully" });
        }
      } catch (err) {
        console.warn("DB delete failed, routing to Memory Store fallback", err);
      }
    }

    // Memory Mode delete
    const store = getMemoryStore();
    const idx = store.findIndex(c => c._id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Contact not found" });
    }

    store.splice(idx, 1);
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

export default router;
