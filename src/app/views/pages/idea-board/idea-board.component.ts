import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from 'src/app/core/utilities/modal';
declare var $: any;

@Component({
  selector: 'app-idea-board',
  imports: [CommonModule, FormsModule ],
  standalone: true,
  templateUrl: './idea-board.component.html',
  styleUrls: ['./idea-board.component.scss']
})
export class IdeaBoardComponent implements OnInit {

  constructor(private modalService: ModalService){}

  // State variables
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  searchText = '';
  categoryFilter = 'all';
  colorFilter = 'all';
  
  // Data arrays
  ideas: any[] = [];
  filteredIdeas: any[] = [];
  categories: string[] = ['Business', 'Technology', 'Design', 'Marketing', 'Personal', 'Other'];
  colorOptions = [
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Red', value: '#fee2e2' },
    { name: 'Purple', value: '#ede9fe' }
  ];
  
  // Form model
  form = {
    idea: {
      _id: '',
      title: '',
      description: '',
      category: '',
      color: '#dbeafe',
      createdAt: new Date()
    }
  };

  ngOnInit() {
    this.loadIdeas();
  }

  loadIdeas() {
    this.isLoading = true;
    // In a real application, you would call a service to get ideas from an API
    setTimeout(() => {
      // Mock data for demonstration
      this.ideas = [
        {
          _id: '1',
          title: 'New Mobile App',
          description: 'Create a fitness tracking app with AI personal trainer',
          category: 'Technology',
          color: '#dbeafe',
          createdAt: new Date('2023-10-15')
        },
        {
          _id: '2',
          title: 'Content Strategy',
          description: 'Develop a quarterly content calendar for social media',
          category: 'Marketing',
          color: '#d1fae5',
          createdAt: new Date('2023-10-10')
        },
        // Add more mock ideas as needed
      ];
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredIdeas = this.ideas.filter(idea => {
      const matchesSearch = !this.searchText || 
        idea.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        idea.description.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesCategory = this.categoryFilter === 'all' || idea.category === this.categoryFilter;
      const matchesColor = this.colorFilter === 'all' || idea.color === this.colorFilter;
      
      return matchesSearch && matchesCategory && matchesColor;
    });
  }

  openIdeaModal() {
    this.modalService.open('ideaFormModal');
    this.isEditMode = false;
    this.onReset();
  }

  onEditIdea(idea: any) {
    this.isEditMode = true;
    this.form.idea = { ...idea };
    this.modalService.open('ideaFormModal');
  }

  onSaveIdea() {
    this.isSaving = true;
    
    if (this.isEditMode) {
      // Update existing idea
      const index = this.ideas.findIndex(i => i._id === this.form.idea._id);
      if (index !== -1) {
        this.ideas[index] = { ...this.form.idea };
      }
    } else {
      // Add new idea
      const newIdea = {
        ...this.form.idea,
        _id: Math.random().toString(36).substr(2, 9), // Generate a unique ID
        createdAt: new Date()
      };
      this.ideas.push(newIdea);
    }
    
    this.applyFilters();
    this.isSaving = false;
    this.modalService.close('ideaFormModal');
  }

  onDeleteIdea(id: string) {
    if (confirm('Are you sure you want to delete this idea?')) {
      this.ideas = this.ideas.filter(idea => idea._id !== id);
      this.applyFilters();
    }
  }

  onReset() {
    
    this.form.idea = {
      _id: '',
      title: '',
      description: '',
      category: '',
      color: '#dbeafe',
      createdAt: new Date()
    };
    this.isEditMode = false;
    $('#ideaFormModal').modal('hide');
  }

  getColorName(colorValue: string): string {
    const color = this.colorOptions.find(c => c.value === colorValue);
    return color ? color.name : 'Unknown';
  }

  isLightColor(color: string): boolean {
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else if (color.length === 7) {
      r = parseInt(color[1] + color[2], 16);
      g = parseInt(color[3] + color[4], 16);
      b = parseInt(color[5] + color[6], 16);
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
}