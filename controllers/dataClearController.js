import db from '../models/index.js';

/**
 * Clear all data from models except User and Staff models
 * This endpoint requires admin/super_admin privileges
 */
export const clearAllData = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Models to preserve (User and Staff)
    const preservedModels = ['User', 'Staff'];
    
    // Get all model names
    const allModelNames = Object.keys(db).filter(name => 
      name !== 'sequelize' && 
      name !== 'Sequelize' && 
      typeof db[name] === 'object' && 
      db[name].destroy
    );
    
    // Models to clear (all except User and Staff)
    const modelsToClear = allModelNames.filter(name => !preservedModels.includes(name));
    
    console.log('Models to preserve:', preservedModels);
    console.log('Models to clear:', modelsToClear);
    
    // Clear data from each model
    const clearingResults = [];
    
    for (const modelName of modelsToClear) {
      const model = db[modelName];
      
      try {
        // Clear all data from the model
        const deletedCount = await model.destroy({
          where: {}, // Empty where clause to delete all records
          force: true, // Force delete (skip soft deletes)
          transaction
        });
        
        clearingResults.push({
          model: modelName,
          recordsDeleted: deletedCount,
          status: 'success'
        });
        
        console.log(`Cleared ${deletedCount} records from ${modelName}`);
        
      } catch (clearError) {
        console.error(`Error clearing ${modelName}:`, clearError);
        clearingResults.push({
          model: modelName,
          error: clearError.message,
          status: 'failed'
        });
      }
    }
    
    // Get preserved data counts
    const preservedDataCounts = {};
    for (const modelName of preservedModels) {
      try {
        preservedDataCounts[modelName] = await db[modelName].count({ transaction });
      } catch (countError) {
        console.error(`Error counting ${modelName}:`, countError);
        preservedDataCounts[modelName] = 'Error counting';
      }
    }
    
    // Commit the transaction
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Data clearing operation completed',
      summary: {
        totalModelsProcessed: modelsToClear.length,
        successfulClears: clearingResults.filter(r => r.status === 'success').length,
        failedClears: clearingResults.filter(r => r.status === 'failed').length,
        preservedModels: preservedModels,
        preservedDataCounts
      },
      details: clearingResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error('Data clearing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Data clearing operation failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get data summary before clearing (preview)
 */
export const getDataSummary = async (req, res) => {
  try {
    const preservedModels = ['User', 'Staff'];
    
    // Get all model names
    const allModelNames = Object.keys(db).filter(name => 
      name !== 'sequelize' && 
      name !== 'Sequelize' && 
      typeof db[name] === 'object' && 
      db[name].count
    );
    
    const modelsToClear = allModelNames.filter(name => !preservedModels.includes(name));
    
    // Get counts for all models
    const summary = {};
    
    for (const modelName of allModelNames) {
      try {
        const count = await db[modelName].count();
        summary[modelName] = {
          count: count,
          willBeCleared: !preservedModels.includes(modelName)
        };
      } catch (error) {
        summary[modelName] = {
          count: 'Error counting',
          willBeCleared: !preservedModels.includes(modelName),
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      message: 'Data summary retrieved',
      preservedModels,
      modelsToClear,
      summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting data summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data summary',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
