import { useState } from "react";
import { useContacts } from "./hooks/useContacts";

const API_BASE = "https://leo-my-ai-assistant.onrender.com";

export default function JarvisMail() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", group: "FAMILIA" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [drafting, setDrafting] = useState(false);

  const handleAdd = () => {
    if (formData.name && formData.email) {
      addContact(formData.name, formData.email, formData.group);
      setFormData({ name: "", email: "", group: "FAMILIA" });
      setShowAddForm(false);
    }
  };

  const handleEdit = (id, name, email) => {
    updateContact(id, name, email);
    setEditingId(null);
  };

  async function draftWithAI() {
    if (!to || !description) { alert("Ingresa email y descripción"); return; }
    const prompt = `Redacta un email profesional en español para: ${description}`;
    setDrafting(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, session_id: "mail_draft" }),
      });
      const d = await res.json();
      console.log("Email draft:", d);
    } catch (e) {
      console.error("Error:", e);
    }
    finally { setDrafting(false); }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, padding: "0 24px 24px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Left: Contacts */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", height: "fit-content" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>
          📇 Contactos favoritos
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{
            width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 9,
            background: "#2563EB", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500
          }}>
            {showAddForm ? "Cancelar" : "+ Agregar contacto"}
          </button>

          {showAddForm && (
            <div style={{ padding: "12px", background: "#F8FAFC", borderRadius: "8px", gap: 8, display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ padding: "6px 8px", fontSize: "12px", border: "1px solid #E2E8F0", borderRadius: "4px" }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ padding: "6px 8px", fontSize: "12px", border: "1px solid #E2E8F0", borderRadius: "4px" }}
              />
              <select
                value={formData.group}
                onChange={(e) => setFormData({...formData, group: e.target.value})}
                style={{ padding: "6px 8px", fontSize: "12px", border: "1px solid #E2E8F0", borderRadius: "4px" }}
              >
                <option value="FAMILIA">FAMILIA</option>
                <option value="UDEM/ESCUELA">UDEM/ESCUELA</option>
                <option value="TRABAJO">TRABAJO</option>
              </select>
              <button onClick={handleAdd} style={{
                padding: "6px 12px", background: "#10B981", color: "#fff",
                border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px"
              }}>
                Guardar
              </button>
            </div>
          )}

          {contacts.map(contact => (
            <div key={contact.id} style={{
              padding: "10px", background: "#F8FAFC", borderRadius: "8px",
              display: "flex", flexDirection: "column", gap: 8
            }}>
              {editingId === contact.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={{ padding: "4px 6px", fontSize: "11px", border: "1px solid #E2E8F0", borderRadius: "4px" }}
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    style={{ padding: "4px 6px", fontSize: "11px", border: "1px solid #E2E8F0", borderRadius: "4px" }}
                  />
                  <button onClick={() => handleEdit(contact.id, editForm.name, editForm.email)} style={{
                    padding: "4px 8px", background: "#10B981", color: "#fff",
                    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px"
                  }}>
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{contact.name}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{contact.email}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, width: "100%" }}>
                    <button onClick={() => { setEditingId(contact.id); setEditForm({ name: contact.name, email: contact.email }); }} style={{
                      flex: 1, padding: "4px 8px", background: "#2563EB", color: "#fff",
                      border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px"
                    }}>
                      Editar
                    </button>
                    <button onClick={() => deleteContact(contact.id)} style={{
                      flex: 1, padding: "4px 8px", background: "#EF4444", color: "#fff",
                      border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px"
                    }}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Mail Form */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 20 }}>
          ✉️ Redactor con IA
        </div>

        {/* Para field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Para:</label>
          <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="destinatario@example.com"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
              fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "inherit",
            }}/>
        </div>

        {/* Asunto field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Asunto:</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Tema del email"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
              fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "inherit",
            }}/>
        </div>

        {/* Description field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>¿Sobre qué quieres escribir?</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe brevemente el tema del email..."
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
              fontSize: 13, color: "#0F172A", outline: "none", fontFamily: "inherit",
              minHeight: 80, resize: "vertical",
            }}/>
        </div>

        {/* Draft button */}
        <button onClick={draftWithAI} disabled={drafting} style={{
          width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
          background: drafting ? "#E2E8F0" : "linear-gradient(135deg,#2563EB,#7C3AED)",
          color: drafting ? "#94A3B8" : "#fff", fontSize: 13, fontWeight: 700, cursor: drafting ? "not-allowed" : "pointer",
        }}>
          {drafting ? "⏳ Redactando..." : "✨ Redactar con Jarvis"}
        </button>
      </div>
    </div>
  );
}
