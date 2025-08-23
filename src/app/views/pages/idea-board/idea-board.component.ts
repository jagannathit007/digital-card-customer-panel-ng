import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from 'src/app/core/utilities/modal';
import { IdeaBoardService } from 'src/app/services/idea-board.service';
declare var $: any;

@Component({
  selector: 'app-idea-board',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './idea-board.component.html',
  styleUrls: ['./idea-board.component.scss'],
})
export class IdeaBoardComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private ideaBoardService: IdeaBoardService
  ) {}

  // State variables
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  searchText = '';
  categoryFilter = 'all';
  colorFilter = 'all';

  // Category management states
  isLoadingCategories = false;
  isSavingCategory = false;
  isEditCategoryMode = false;

  // Data arrays
  ideas: any[] = [];
  filteredIdeas: any[] = [];
  categories: string[] = [
    'Business',
    'Technology',
    'Design',
    'Marketing',
    'Personal',
    'Other',
  ];
  categoryList: any[] = [];
  colorOptions = [
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Red', value: '#fee2e2' },
    { name: 'Purple', value: '#ede9fe' },
  ];

  // Form model
  form = {
    idea: {
      _id: '',
      title: '',
      description: '',
      category: '',
      categoryId: '',
      color: '#dbeafe',
      createdAt: new Date(),
    },
  };

  // Category form models
  categoryForm = {
    name: '',
  };

  editCategoryForm = {
    _id: '',
    name: '',
  };

  ngOnInit() {
    this.loadIdeas();
    this.loadCategories();
    this.loadCategoryList();
  }

  async loadIdeas() {
    this.isLoading = true;
    try {
      const response = await this.ideaBoardService.getIdeas({
        page: 1,
        limit: 50,
        search: this.searchText,
      });

      if (response && response.docs) {
        this.ideas = response.docs.map((idea: any) => ({
          _id: idea._id,
          title: idea.ideaText,
          description: idea.ideaText,
          category: idea.categoryId?.name || 'Uncategorized',
          categoryId: idea.categoryId?._id,
          color: idea.color || '#dbeafe',
          createdAt: new Date(idea.createdAt),
        }));
      } else {
        this.ideas = [];
      }
      this.applyFilters();
    } catch (error) {
      console.error('Error loading ideas:', error);
      this.ideas = [];
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories() {
    try {
      const response = await this.ideaBoardService.getIdeaCategories();
      if (response && Array.isArray(response)) {
        this.categories = response.map((cat: any) => cat.name);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadCategoryList() {
    this.isLoadingCategories = true;
    try {
      const response = await this.ideaBoardService.getIdeaCategories();
      if (response && Array.isArray(response)) {
        this.categoryList = response;
      } else {
        this.categoryList = [];
      }
    } catch (error) {
      console.error('Error loading category list:', error);
      this.categoryList = [];
    } finally {
      this.isLoadingCategories = false;
    }
  }

  onSearch() {
    this.loadIdeas();
  }

  applyFilters() {
    this.filteredIdeas = this.ideas.filter((idea) => {
      const matchesCategory =
        this.categoryFilter === 'all' || idea.category === this.categoryFilter;
      const matchesColor =
        this.colorFilter === 'all' || idea.color === this.colorFilter;

      return matchesCategory && matchesColor;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  openIdeaModal() {
    this.modalService.open('ideaFormModal');
    this.isEditMode = false;
    this.onReset();
  }

  onEditIdea(idea: any) {
    this.isEditMode = true;
    this.form.idea = {
      _id: idea._id,
      title: idea.title,
      description: idea.description,
      category: idea.category,
      categoryId: idea.categoryId || '',
      color: idea.color,
      createdAt: idea.createdAt,
    };
    this.modalService.open('ideaFormModal');
  }

  async onSaveIdea() {
    if (!this.form.idea.title || !this.form.idea.description) {
      return;
    }

    this.isSaving = true;

    try {
      const payload = {
        ideaText: this.form.idea.title,
        categoryId: this.form.idea.categoryId,
        color: this.form.idea.color,
      };

      let response;
      if (this.isEditMode) {
        response = await this.ideaBoardService.updateIdea({
          ideaId: this.form.idea._id,
          ...payload,
        });
      } else {
        // Add new idea
        response = await this.ideaBoardService.addIdea(payload);
      }

      if (response) {
        await this.loadIdeas();
        this.modalService.close('ideaFormModal');
        this.onReset(); // Reset form after successful save
      }
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async onDeleteIdea(id: string) {
    if (confirm('Are you sure you want to delete this idea?')) {
      try {
        const response = await this.ideaBoardService.deleteIdea({ ideaId: id });
        if (response) {
          await this.loadIdeas();
        }
      } catch (error) {
        console.error('Error deleting idea:', error);
      }
    }
  }

  onReset() {
    this.form.idea = {
      _id: '',
      title: '',
      description: '',
      category: '',
      categoryId: '',
      color: '#dbeafe',
      createdAt: new Date(),
    };
    this.isEditMode = false;
  }

  onResetAndClose() {
    this.onReset();
    this.modalService.close('ideaFormModal');
  }

  getColorName(colorValue: string): string {
    const color = this.colorOptions.find((c) => c.value === colorValue);
    return color ? color.name : 'Unknown';
  }

  isLightColor(color: string): boolean {
    let r = 0,
      g = 0,
      b = 0;

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

  // Category Management Methods
  openCategoryModal() {
    this.modalService.open('categoryFormModal');
    this.loadCategoryList();
  }

  async onSaveCategory() {
    if (!this.categoryForm.name.trim()) {
      return;
    }

    this.isSavingCategory = true;
    try {
      const response = await this.ideaBoardService.addIdeaCategory({
        name: this.categoryForm.name.trim(),
      });

      if (response) {
        this.categoryForm.name = '';
        await this.loadCategoryList();
        await this.loadCategories(); // Refresh dropdown categories
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      this.isSavingCategory = false;
    }
  }

  onEditCategory(category: any) {
    this.isEditCategoryMode = true;
    this.editCategoryForm = {
      _id: category._id,
      name: category.name,
    };
    this.modalService.close('categoryFormModal');
    this.modalService.open('editCategoryModal');
  }

  async onUpdateCategory() {
    if (!this.editCategoryForm.name.trim()) {
      return;
    }

    this.isSavingCategory = true;
    try {
      const response = await this.ideaBoardService.updateIdeaCategory({
        categoryId: this.editCategoryForm._id,
        name: this.editCategoryForm.name.trim(),
      });

      if (response) {
        await this.loadCategoryList();
        await this.loadCategories(); // Refresh dropdown categories
        this.onResetEditCategory();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      this.isSavingCategory = false;
    }
  }

  async onDeleteCategory(categoryId: string) {
    if (
      confirm(
        'Are you sure you want to delete this category? Ideas in this category will become uncategorized.'
      )
    ) {
      try {
        const response = await this.ideaBoardService.deleteIdeaCategory({
          categoryId,
        });
        if (response) {
          await this.loadCategoryList();
          await this.loadCategories(); // Refresh dropdown categories
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  }

  onResetCategory() {
    this.categoryForm.name = '';
    this.modalService.close('categoryFormModal');
  }

  onResetEditCategory() {
    this.editCategoryForm = {
      _id: '',
      name: '',
    };
    this.isEditCategoryMode = false;
    this.modalService.close('editCategoryModal');
  }
}
