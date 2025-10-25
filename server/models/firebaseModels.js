const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class FirebaseModel {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
  }

  async create(data) {
    try {
      const docRef = await this.collection.add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  async findAll(where = {}) {
    try {
      let query = this.collection;
      
      // Apply where conditions
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined) {
          query = query.where(key, '==', where[key]);
        }
      });
      
      const snapshot = await query.get();
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      return docs;
    } catch (error) {
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      await this.collection.doc(id).update({
        ...data,
        updatedAt: new Date()
      });
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  async count(where = {}) {
    try {
      const docs = await this.findAll(where);
      return docs.length;
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }
}

// User Model
class User extends FirebaseModel {
  constructor() {
    super('users');
  }

  async create(userData) {
    // Hash password before storing
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    return super.create(userData);
  }

  async findByEmail(email) {
    const users = await this.findAll({ email });
    return users.length > 0 ? users[0] : null;
  }

  async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return this.update(id, { password: hashedPassword });
  }
}

// Drug Model
class Drug extends FirebaseModel {
  constructor() {
    super('drugs');
  }

  async findByName(name) {
    const drugs = await this.findAll({ name });
    return drugs.length > 0 ? drugs[0] : null;
  }

  async findByDrugClass(drugClass) {
    return this.findAll({ drugClass });
  }
}

// Prescription Model
class Prescription extends FirebaseModel {
  constructor() {
    super('prescriptions');
  }

  async findByPatientId(patientId) {
    return this.findAll({ patientId });
  }

  async findByDoctorId(doctorId) {
    return this.findAll({ doctorId });
  }

  async findActiveByPatientId(patientId) {
    return this.findAll({ patientId, isActive: true });
  }
}

// SideEffect Model
class SideEffect extends FirebaseModel {
  constructor() {
    super('sideEffects');
  }

  async findByPrescriptionId(prescriptionId) {
    return this.findAll({ prescriptionId });
  }

  async findByDrugId(drugId) {
    return this.findAll({ drugId });
  }

  async findConcerning() {
    return this.findAll({ isConcerning: true });
  }

  async findByPatientId(patientId) {
    // This would require a more complex query or denormalization
    // For now, we'll get all side effects and filter
    const allSideEffects = await this.findAll();
    return allSideEffects.filter(se => se.patientId === patientId);
  }
}

// DrugInteraction Model
class DrugInteraction extends FirebaseModel {
  constructor() {
    super('drugInteractions');
  }

  async findByDrugIds(drugId1, drugId2) {
    const interactions = await this.findAll();
    return interactions.filter(interaction => 
      (interaction.drugId1 === drugId1 && interaction.drugId2 === drugId2) ||
      (interaction.drugId1 === drugId2 && interaction.drugId2 === drugId1)
    );
  }
}

// AnalyticsAlert Model
class AnalyticsAlert extends FirebaseModel {
  constructor() {
    super('analyticsAlerts');
  }

  async findUnresolved() {
    return this.findAll({ isResolved: false });
  }

  async findByType(alertType) {
    return this.findAll({ alertType });
  }
}

module.exports = {
  User,
  Drug,
  Prescription,
  SideEffect,
  DrugInteraction,
  AnalyticsAlert
};
