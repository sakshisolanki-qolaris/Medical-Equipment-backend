import * as AllocationService from './allocation.service.js';

export const allocateEquipment = async (req, res) => {
  try {
    const result = await AllocationService.processAllocation(req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('Insufficient deposit') || error.message.includes('currently allotted')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Allocation Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const fetchAllocations = async (req, res) => {
  try {
    const result = await AllocationService.getCursorPaginatedAllocations(req.query);
    
    return res.status(200).json({
      message: 'Allocations fetched successfully',
      ...result 
    });
  } catch (error) {
    console.error('Fetch Allocations Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};