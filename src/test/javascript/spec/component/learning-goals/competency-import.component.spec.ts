import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'app/shared/components/button.component';
import { SortService } from 'app/shared/service/sort.service';
import { PageableSearch, SearchResult, SortingOrder } from 'app/shared/table/pageable-table';
import { MockComponent, MockDirective } from 'ng-mocks';
import { of } from 'rxjs';
import { ArtemisTestModule } from '../../test.module';
import { SortByDirective } from 'app/shared/sort/sort-by.directive';
import { SortDirective } from 'app/shared/sort/sort.directive';
import { CompetencyImportComponent } from 'app/course/learning-goals/learning-goal-management/competency-import.component';
import { LearningGoalPagingService } from 'app/course/learning-goals/learning-goal-paging.service';
import { LearningGoal } from 'app/entities/learningGoal.model';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { TableColumn } from 'app/shared/import/import-component';

describe('CompetencyImportComponent', () => {
    let fixture: ComponentFixture<CompetencyImportComponent>;
    let comp: CompetencyImportComponent;
    let pagingService: LearningGoalPagingService;
    let sortService: SortService;
    let searchForCompetenciesStub: jest.SpyInstance;
    let sortByPropertyStub: jest.SpyInstance;
    let searchResult: SearchResult<LearningGoal>;
    let state: PageableSearch;
    let competency: LearningGoal;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ArtemisTestModule, FormsModule, MockComponent(NgbPagination)],
            declarations: [CompetencyImportComponent, MockComponent(ButtonComponent), MockDirective(SortByDirective), MockDirective(SortDirective)],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(CompetencyImportComponent);
                comp = fixture.componentInstance;
                pagingService = TestBed.inject(LearningGoalPagingService);
                sortService = TestBed.inject(SortService);
                searchForCompetenciesStub = jest.spyOn(pagingService, 'searchForLearningGoals');
                sortByPropertyStub = jest.spyOn(sortService, 'sortByProperty');
            });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        fixture.detectChanges();
        competency = new LearningGoal();
        competency.id = 1;
        searchResult = { numberOfPages: 3, resultsOnPage: [competency] };
        state = {
            page: 1,
            pageSize: 10,
            searchTerm: 'initialSearchTerm',
            sortingOrder: SortingOrder.DESCENDING,
            sortedColumn: TableColumn.ID,
            ...searchResult,
        };
        searchForCompetenciesStub.mockReturnValue(of(searchResult));
    });

    const setStateAndCallOnInit = (middleExpectation: () => void) => {
        comp.state = { ...state };
        comp.ngOnInit();
        middleExpectation();
        expect(comp.content).toEqual(searchResult);
        comp.sortRows();
        expect(sortByPropertyStub).toHaveBeenCalledWith(searchResult.resultsOnPage, comp.sortedColumn, comp.listSorting);
    };

    it('should set content to paging result on sort', fakeAsync(() => {
        expect(comp.listSorting).toBeFalse();
        setStateAndCallOnInit(() => {
            comp.listSorting = true;
            tick(10);
            expect(searchForCompetenciesStub).toHaveBeenCalledWith({ ...state, sortingOrder: SortingOrder.ASCENDING });
            expect(comp.listSorting).toBeTrue();
        });
    }));

    it('should set content to paging result on pageChange', fakeAsync(() => {
        expect(comp.page).toBe(1);
        setStateAndCallOnInit(() => {
            comp.onPageChange(5);
            tick(10);
            expect(searchForCompetenciesStub).toHaveBeenCalledWith({ ...state, page: 5 });
            expect(comp.page).toBe(5);
        });
    }));

    it('should set content to paging result on search', fakeAsync(() => {
        expect(comp.searchTerm).toBe('');
        setStateAndCallOnInit(() => {
            const givenSearchTerm = 'givenSearchTerm';
            comp.searchTerm = givenSearchTerm;
            tick(10);
            expect(searchForCompetenciesStub).not.toHaveBeenCalled();
            tick(290);
            expect(searchForCompetenciesStub).toHaveBeenCalledWith({ ...state, searchTerm: givenSearchTerm });
            expect(comp.searchTerm).toEqual(givenSearchTerm);
        });
    }));

    it('should set content to paging result on sortedColumn change', fakeAsync(() => {
        expect(comp.sortedColumn).toEqual(TableColumn.ID);
        setStateAndCallOnInit(() => {
            comp.sortedColumn = TableColumn.TITLE;
            tick(10);
            expect(searchForCompetenciesStub).toHaveBeenCalledWith({ ...state, sortedColumn: TableColumn.TITLE });
            expect(comp.sortedColumn).toEqual(TableColumn.TITLE);
        });
    }));

    it('should return competency id', () => {
        expect(comp.trackId(0, competency)).toEqual(competency.id);
    });
});